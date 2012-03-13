//
//  http://www.weechat.org/files/doc/devel/weechat_relay_protocol.en.html
//
var zlib = require('zlib');

// data is side-effected variable used during parsing
var data, types = {
    chr: getChar,
    int: getInt,
    // hacks
    lon: getPointer,
    str: getString,
    buf: getBuffer,
    ptr: getPointer,
    // hacks
    tim: getPointer,
    htb: getHashtable,
    hda: getHdata,
    inf: getInfo,
    inl: getInfolist
};

exports.Parser = Parser;

function Parser(cb) {
    if (! (this instanceof Parser)) return new Parser(cb);

    var totalData, self = this,
    total = 0;

    function parseData(d, cb) {
        data = d;
        var id = getString(),
        obj = parse();

        if (cb) cb(id, obj);
        total = 0;

        if (data.length > total) {
            data = data.slice(total);
            self.onData(data, cb);
        }
    }

    this.onData = function(part) {
        var tmp, compression;

        if (total === 0) {
            data = totalData = part;
            total = getInt();
            // getInt is 4 bytes
            //total -= 4;
        } else {
            tmp = new Buffer(totalData.length + part.length);
            totalData.copy(tmp);
            part.copy(tmp, totalData.length);
            totalData = tmp;
        }

        if (totalData.length >= total) {
            // Set data to be parsed
            data = totalData;
            // Remove total from data
            getInt();
            compression = getChar();
            if (compression) {
                zlib.unzip(data, function(err, data) {
                    if (err) throw err;
                    parseData(data, cb);
                });
            } else {
                parseData(data, cb);
            }

        }
    };
}

// Helper
function loop(range, cb) {
    var i;
    for (i = 0; i < range; i++) {
        cb(i);
    }
}

function parse() {
    var type;
    if (data.length < 3) {
        return null;
    }
    return runType(getType());
}

function runType(type) {
    if (types[type]) {
        return types[type]();
    } else {
        throw new Error('Unknown type: ' + type);
    }
}

function getChar() {
    var c = data[0];
    data = data.slice(1);
    return c;
}

function getInt() {
    var i = ((data[0] & 0xff) << 24) | ((data[1] & 0xff) << 16) | ((data[2] & 0xff) << 8) | (data[3] & 0xff);
    data = data.slice(4);
    return i >= 0 ? i: null;
}

function getString() {
    var l = getInt(),
    s = data.slice(0, l);
    data = data.slice(l);
    return s.toString();
}

function getBuffer() {
    throw 'Type not implemented: Buffer';
}

function getPointer() {
    var l = data[0],
    pointer = data.slice(1, l + 1);
    data = data.slice(l + 1);
    return pointer.toString();
}

function getHashtable() {
    var i, typeKeys = getType(),
    typeValues = getType(),
    count = getInt(),
    obj = {};

    loop(count, function() {
        obj[types[typeKeys]()] = runType(typeValues);
    });
    return obj;
}

function getHdata() {
    var keys, paths, count, objs = [],
    hpath = getString();

    keys = getString().split(',');
    paths = hpath.split('/');
    count = getInt();

    keys = keys.map(function(key) {
        return key.split(':');
    });

    loop(count, function() {
        var tmp = {};
        tmp.pointers = paths.map(function(path) {
            return getPointer();
        });
        keys.forEach(function(key) {
            tmp[key[0]] = runType(key[1]);
        });
        objs.push(tmp);
    });
    return objs;
}

function getInfo() {
    return {
        key: getString(),
        value: getString()
    };
}

function getType() {
    var t = data.slice(0, 3);
    data = data.slice(3);
    return t;
}

function getInfolist() {
    throw 'Type not implemented: infolist';
}

