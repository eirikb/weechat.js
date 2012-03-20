var zlib = require('zlib'),
protocol = require('./protocol.js');

exports.Parser = function Parser(cb) {
    if (! (this instanceof Parser)) return new Parser(cb);

    var data, self = this,
    total = 0,
    unzipping = false;

    function parseData(data, cb) {
        protocol.setData(data);
        var id = protocol.getString(),
        obj = protocol.parse();

        if (cb) cb(id, obj);
        total = 0;
    }

    function gotParts(data) {
        protocol.setData(data);
        // Remove total from data
        protocol.getInt();
        compression = protocol.getChar();
        data = protocol.getData();

        if (compression) {
            unzipping = true;
            zlib.unzip(data, function(err, data) {
                unzipping = false;
                if (err) throw err;
                parseData(data, cb);
            });
        } else {
            parseData(data, cb);
        }
    }

    function concatBuffers(bufferA, bufferB) {
        var buffer = new Buffer(bufferA.length + bufferB.length);
        bufferA.copy(buffer);
        bufferB.copy(buffer, bufferA.length);
        return buffer;
    }

    this.onData = function(part) {
        var tmp, compression;

        if (unzipping || total !== 0) {
            concatBuffers(data, part);
        } else {
            data = part;
            protocol.setData(data);
            total = protocol.getInt();

            if (data.length >= total) {
                tmp = null;
                if (data.length > total) {
                    tmp = data.slice(0, total);
                    data = data.slice(total);
                }

                gotParts(data);

                if (tmp) {
                    self.onData(tmp);
                }
            }
        }
    };
};

