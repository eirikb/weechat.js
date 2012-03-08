var net = require('net'),
events = require('events'),
protocol = require('./protocol.js'),
color = require('./color.js');

var id = 0,
em = new events.EventEmitter(),
self = this;

var getbuffers = 'hdata buffer:gui_buffers(*) number,full_name,type,title,local_variables',
getlines1 = 'hdata buffer:',
getlines2 = '/own_lines/first_line(*)/data',
getnicks = 'nicklist';

var aliases = {
    line: '_buffer_line_added',
    open: '_buffer_opened',
    close: '_buffer_closing',
    renamed: '_buffer_renamed',
    localvar: '_buffer_localvar_added',
    title: '_buffer_title_change',
    nicklist: '_nicklist'
};

exports.style = function(line) {
    return color.parse(line);
};

exports.connect = function(port, host, password, cb) {
    if (arguments.length === 3) {
        cb = password;
        password = host;
    }
    return new WeeChat(port, host, password, cb);
};

function WeeChat(port, host, password, cb) {
    if (! (this instanceof WeeChat)) return new WeeChat(port, host, password, cb);
    var client = net.connect(port, host, password, function connect() {
        var err = false;
        self.write('init password=' + password + ',compression=off');
        // Ping test password 
        self.write('info version');
        client.on('end', function() {
            err = 'Wrong password';
        });
        setTimeout(function() {
            if (!err) {
                client.on('data', onData);
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

    this.on = function(listener, cb) {
        if (arguments.length === 1) {
            cb = listener;
            listener = '*';
        }

        em.on(listener, cb);
        if (aliases[listener]) {
            em.on(aliases[listener], cb);
        }
    };

    this.write = function(msg, cb) {
        id++;
        if (cb) em.once(id, cb);
        client.write('(' + id + ') ' + msg + '\n');
    };

    this.version = function(cb) {
        if (cb) {
            self.write('info version', function(v) {
                cb(v[0].value);
            });
        }
    };

    this.buffers = function(cb) {
        if (cb) {
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
        }
    };

    this.lines = function(bufferid, cb) {
        if (arguments.length === 1) {
            cb = bufferid;
            bufferid = 'gui_buffers(*)';
        }
        if (cb) {
            self.write(getlines1 + bufferid + getlines2, function(lines) {
                lines = lines.map(function(line) {
                    return {
                        buffer: '0x' + line.pointers[0],
                        prefix: line.prefix,
                        date: line.date,
                        displayed: line.displayed,
                        message: line.message
                    };
                });
                cb(lines);
            });
        }
    };

    this.bufferlines = function(cb) {
        if (cb) {
            self.lines(function(lines) {
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

    function onData(data) {
        protocol.data(data, function(id, obj) {
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
        });
    }
}

