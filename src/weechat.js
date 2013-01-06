var net = require('net');
var events = require('events');
var format = require('util').format;
var Parser = require('./parser.js');
var color = require('./color.js');

var aliases = {
    line: '_buffer_line_added',
    open: '_buffer_opened',
    close: '_buffer_closing',
    renamed: '_buffer_renamed',
    localvar: '_buffer_localvar_added',
    title: '_buffer_title_change',
    nicklist: '_nicklist'
};

function style(line) {
    return color.parse(line) || [];
}

function noStyle(line) {
    var parts = style(line);

    line = parts.map(function(part) {
        return part.text;
    }).join('');

    return line;
}

function connect(host, port, password, cb) {
    var self = {};
    var id = 0;
    var em = new events.EventEmitter();
    var parser = new Parser(onParsed);
    var connected = false;

    function onParsed(id, obj) {
        if (!id) id = '';

        [id, '*'].forEach(function(l) {
            if (!Array.isArray(obj)) obj = [obj];

            obj = obj.map(function(o) {
                if (o.pointers) {
                    o.pointers = o.pointers.map(function(p) {
                        if (!p.match(/^0x/)) {
                            return '0x' + p;
                        }
                        return p;
                    });
                }
                if (o.buffer && !o.buffer.match(/^0x/)) {
                    o.buffer = '0x' + o.buffer;
                }
                return o;
            });
            if (obj.length === 1) obj = obj[0];

            em.emit(l, obj, id);
        });
    }

    var client = net.connect(port, host, function() {
        self.send('init password=' + password);
        self.send('info version', function() {
            connected = true;
            self.send('sync');
            if (cb) cb();
        });
    });

    client.on('data', function(data) {
        try {
            parser.onData(data);
        } catch (err) {
            em.emit('error', err);
        }
    });

    client.on('error', function(err) {
        em.emit('error', err);
    });

    client.on('end', function() {
        if (!connected) em.emit('error', new Error('Wrong password'));
        else em.emit('end');
    });

    self.on = function(listener, cb) {
        if (arguments.length === 1) {
            cb = listener;
            listener = '*';
        }

        em.on(listener, cb);
        if (aliases[listener]) {
            em.on(aliases[listener], cb);
        }
    };

    self.send = function(msg, cb) {
        id++;
        if (cb) em.once(id, cb);
        client.write('(' + id + ') ' + msg + '\n');
    };

    return self;
}

exports.style = style;
exports.noStyle = noStyle;
exports.connect = connect;
