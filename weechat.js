var net = require('net');
var events = require('events');
var format = require('util').format;
var Parser = require('./parser.js');
var color = require('./color.js');

var getbuffers = 'hdata buffer:gui_buffers(*) number,full_name,type,title,local_variables';
var getlines = 'hdata buffer:%s/own_lines/last_line(-%s)/data';
var getnicks = 'nicklist';

var aliases = {
    line: '_buffer_line_added',
    open: '_buffer_opened',
    close: '_buffer_closing',
    renamed: '_buffer_renamed',
    localvar: '_buffer_localvar_added',
    title: '_buffer_title_change',
    nicklist: '_nicklist'
};

module.exports = WeeChat;

function WeeChat() {
    if (! (this instanceof WeeChat)) return new WeeChat();

    var self = this;
    var id = 0;
    var em = new events.EventEmitter();

    self.style = function(line) {
        return color.parse(line) || [];
    };

    self.connect = function(host, port, password, cb) {
        client = net.connect(port, host, function connect() {
            var err = false;
            var parser = new Parser(onParsed);

            self.write('init password=' + password);
            // Ping test password 
            self.write('info version');
            client.on('end', function() {
                err = 'Wrong password';
            });
            setTimeout(function() {
                if (!err) {

                    client.on('data', function(data) {
                        try {
                            parser.onData(data);
                        } catch(err) {
                            console.error(err);
                            em.emit('error', err);
                        }
                    });
                    self.write('sync');
                }
                if (cb) {
                    cb(err);
                }
            },
            100);
        });
        client.on('error', function(err) {
            cb(err);
        });
    };

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

    self.write = function(msg, cb) {
        id++;
        if (cb) em.once(id, cb);
        client.write('(' + id + ') ' + msg + '\n');
    };

    self.version = function(cb) {
        if (cb) {
            self.write('info version', function(v) {
                cb(v[0].value);
            });
        }
    };

    self.buffers = function(cb) {
        if (!cb) return;
        self.write(getbuffers, function(buffers) {
            buffers = buffers.map(function(buffer) {
                var lv = buffer.local_variables;
                return {
                    id: buffer.pointers[0],
                    number: buffer.number,
                    fullName: buffer.full_name,
                    typeId: buffer.type,
                    title: buffer.title,
                    plugin: lv.plugin,
                    channel: lv.channel,
                    nick: lv.nick,
                    type: lv.type,
                    name: lv.name
                };
            });
            cb(buffers);
        });
    };

    self.lines = function(count, bufferid, cb) {
        if (arguments.length === 1) {
            cb = count;
            count = '*';
        } else if (arguments.length === 2) {
            cb = bufferid;
        }
        if (arguments.length < 3) bufferid = 'gui_buffers(*)';

        if (cb) {
            self.write(format(getlines, bufferid, count), function(lines) {
                lines = lines.map(function(line) {
                    return {
                        buffer: '0x' + line.pointers[0],
                        prefix: line.prefix,
                        date: line.date,
                        displayed: line.displayed,
                        message: line.message
                    };
                });
                lines.reverse();
                cb(lines);
            });
        }
    };

    self.bufferlines = function(count, cb) {
        if (arguments.length === 1) {
            cb = count;
            count = '*';
        }
        if (cb) {
            self.lines(count, function(lines) {
                self.buffers(function(buffers) {
                    buffers.forEach(function(buffer) {
                        if (!buffer.lines) {
                            buffer.lines = [];
                        }
                        lines.filter(function(line) {
                            return line.buffer.match(buffer.id);
                        }).forEach(function(line) {
                            buffer.lines.push(line);
                        });
                    });
                    cb(buffers);
                });
            });
        }
    };

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
                if (o.buffer && ! o.buffer.match(/^0x/)) {
                    o.buffer = '0x' + o.buffer;
                }
                return o;
            });
            em.emit(l, obj, id);
        });
    }
}

