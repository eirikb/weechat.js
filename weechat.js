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

exports.lines = function(cb) {
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
                    message: line.message
                });
            });
            cb(buffers);
        });
    }
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
                    cb(obj);
                });
            }
        });
    });
}

