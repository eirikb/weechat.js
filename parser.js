var zlib = require('zlib'),
protocol = require('./protocol.js');

exports.Parser = function Parser(cb) {
    if (! (this instanceof Parser)) return new Parser(cb);

    var buffer = new Buffer(0),
    total = 0,
    unzipping = false,
    self = this;

    function parseData(data) {
        protocol.setData(data);
        var id = protocol.getString(),
        obj = protocol.parse();

        if (cb) cb(id, obj);
        total = 0;
    }

    function handleData(data) {
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
                self.onData();
            });
        } else {
            parseData(data, cb);
            self.onData();
        }
    }

    function concatBuffers(bufferA, bufferB) {
        var buffer = new Buffer(bufferA.length + bufferB.length);
        bufferA.copy(buffer);
        bufferB.copy(buffer, bufferA.length);
        return buffer;
    }

    self.onData = function(part) {
        var data;

        if (part) buffer = concatBuffers(buffer, part);

        if (!unzipping) {
            if (total === 0) {
                protocol.setData(buffer);
                total = protocol.getInt();
            }

            // Ready to parse buffer
            if (buffer.length > total) {
                data = buffer.slice(0, total);
                buffer = buffer.slice(total);
                handleData(data);
            }
        }
    };
};

