var net = require('net'),
protocol = require('./protocol.js'),
color = require('./color.js');

var client, id = 0,
callbacks = {},
listeners = {},
self = this;

var getlines = 'hdata buffer:gui_buffers(*)/own_lines/first_line(*)/data',
getbuffers = 'hdata buffer:gui_buffers(*) number,full_name,type,title,local_variables',
getnicks = 'nicklist';

exports.connect = function(port, password, cb) {
    client = net.connect(port, function() {
        var connected = true;
        self.write('init password=' + password + ',compression=off');
        // Ping test password 
        self.write('info version');
        client.on('end', function() {
            connected = false;
        });
        setTimeout(function() {
            if (connected) {
                client.on('data', onData);
                self.write('sync');
            }
            if (cb) {
                cb(connected);
            }
        },
        100);
    });
};

exports.on = function(listener, cb) {
    if (arguments.length === 1) {
        cb = listener;
        listener = '*';
    }
    if (!listeners[listener]) {
        listeners[listener] = [];
    }
    listeners[listener].push(cb);
};

exports.write = function(msg, cb) {
    id++;
    callbacks[id] = cb;
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

exports.bufferlines = function(cb) {
    if (cb) {
        self.write(getlines, function(lines) {
            var buffers = {};
            lines.forEach(function(line) {
                var buffer = line.buffer;
                if (!buffers[buffer]) {
                    buffers[buffer] = [];
                }
                buffers[buffer].push({
                    prefix: line.prefix,
                    date: line.date,
                    displayed: line.displayed,
                    messageParts: color.parse(line.message)
                });
            });
            cb(buffers);
        });
    }
};

exports.onLine = function(cb) {
    self.on('_buffer_line_added', cb);
};

exports.onClose = function(cb) {
    self.on('_buffer_closing', cb);
};

exports.onRenamed = function(cb) {
    self.on('_buffer_renamed', cb);
};

exports.onLocalvar = function(cb) {
    self.on('_buffer_localvar_added', cb);
};

exports.onTitle = function(cb) {
    self.on('_buffer_title_change', cb);
};

exports.onNicklist = function(cb) {
    self.on('_nicklist', cb);
};

function onData(data) {
    protocol.data(data, function(id, obj) {
        cb = callbacks[id];
        if (cb) {
            cb(obj);
            delete callbacks[id];
        }

        [id, '*'].forEach(function(l) {
            if (listeners[l]) {
                listeners[l].forEach(function(cb) {
                    obj.forEach(function(o) {
                        if (o.prefix) {
                            o.prefixParts = color.parse(o.prefix);
                        }
                        if (o.message) {
                            o.messageParts = color.parse(o.message);
                        }
                        o.buffer = o.pointers[0];
                        cb(o, id);
                    });
                });
            }
        });
    });
}

