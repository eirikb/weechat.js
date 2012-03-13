var zlib = require('zlib'),
protocol = require('./protocol.js');

exports.Parser = function Parser(cb) {
    if (! (this instanceof Parser)) return new Parser(cb);

    var data, self = this,
    total = 0;

    function parseData(data, cb) {
        protocol.setData(data);
        var id = protocol.getString(),
        obj = protocol.parse();

        if (cb) cb(id, obj);
        total = 0;
    }

    this.onData = function(part) {
        var tmp, compression;

        if (total === 0) {
            data = part;
            protocol.setData(data);
            total = protocol.getInt();
        } else {
            tmp = new Buffer(data.length + part.length);
            data.copy(tmp);
            part.copy(tmp, data.length);
            data = tmp;
        }

        if (data.length >= total) {
            protocol.setData(data);
            // Remove total from data
            protocol.getInt();
            compression = protocol.getChar();
            data = protocol.getData();

            tmp = null;
            if (data.length > total) {
                tmp = data.slice(0, total);
                data = data.slice(total);
            }
            if (compression) {
                zlib.unzip(data, function(err, data) {
                    if (err) throw err;
                    parseData(data, cb);
                });
            } else {
                parseData(data, cb);
            }
            if (tmp) {
                self.onData(tmp);
            }
        }
    };
};

