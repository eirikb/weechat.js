var net = require('net'),
events = require('events'),
protocol = require('./protocol.js'),
color = require('./color.js');

var client, id = 0,
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

// This should create styles in the future
exports.style = function(line) {
    return color.parse(line);
};

exports.connect = function(port, host, password, cb) {
    function connect() {
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
    }

    if (arguments.length === 4) {
        client = net.connect(port, host, connect);
    } else {
        cb = password;
        password = host;
        client = net.connect(port, connect);
    }

    client.on('error', function(err) {
        cb(err);
    });
};

exports.on = function(listener, cb) {
    if (arguments.length === 1) {
        cb = listener;
        listener = '*';
    }

    if (aliases[listener]) {
        em.on(aliases[listener], cb);
    }
};

exports.write = function(msg, cb) {
    id++;
    if (cb) em.once(id, cb);
    client.write('(' + id + ') ' + msg + '\n');
};

exports.version = function(cb) {
    if (cb) {
        self.write('info version', function(v) {
            cb(v.value);
        });
    }
};

exports.buffers = function(cb) {
    if (cb) {
        self.write(getbuffers, function(buffers) {
            buffers = buffers.map(function(buffer) {
                var lv = buffer.local_variables;
                return {
                    id: '0x' + buffer.pointers[0],
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

exports.lines = function(bufferid, cb) {
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

exports.bufferlines = function(cb) {
    if (cb) {
        self.buffers(function(buffers) {
            self.lines(function(lines) {
                lines.forEach(function(line) {
                    buffers.filter(function(buffer) {
                        return buffer.id.match(line.buffer);
                    }).forEach(function(buffer) {
                        if (!buffer.lines) {
                            buffer.lines = [];
                        }
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

        [id, '*'].forEach(function(l) {
            if (Array.isArray(obj)) {
                obj.forEach(function(o) {
                    o.pointers = o.pointers.map(function(p) {
                        if (!p.match(/^0x/)) {
                            return '0x' + p;
                        }
                        return p;
                    });
                    if (o.buffer && ! o.buffer.match(/^0x/)) {
                        o.buffer = '0x' + o.buffer;
                    }
                    em.emit(l, o, id);
                });
            } else {
                em.emit(l, obj, id);
            }
        });
    });
}

