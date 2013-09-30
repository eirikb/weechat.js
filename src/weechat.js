var net = require('net');
var tls = require('tls');
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

function connect(host, port, password, ssl, cb) {
  var self = {};
  var id = 0;
  var em = new events.EventEmitter();
  var parser = new Parser(onParsed);
  var connected = false;
  var client;

  var timeout = setTimeout(function() {
    var err = new Error('Connect/handshake timeout');
    err.code = 'TIMEOUT';
    em.emit('error', err);
  }, 10000);

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

  function onConnect() {
    clearTimeout(timeout);
    self.send('init password=' + password);
    self.send('info version', function() {
      connected = true;
      self.send('sync');
      if (cb) cb();
    });
  }

  if (ssl) {
    client = tls.connect(port, host, {
      rejectUnauthorized: false
    }, onConnect);
  } else {
    client = net.connect(port, host, onConnect);
  }

  client.on('data', function(data) {
    try {
      parser.onData(data);
    } catch (err) {
      em.emit('error', err);
    }
  });

  client.on('error', function(err) {
    clearTimeout(timeout);
    em.emit('error', err);
  });

  client.on('end', function() {
    clearTimeout(timeout);
    if (!connected) {
      var err = new Error('Wrong password');
      err.code = 'WRONGPASS';
      em.emit('error', err);
    } else {
      em.emit('end');
    }
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

  self.disconnect = function() {
    client.destroy();
  };

  return self;
}

exports.style = style;
exports.noStyle = noStyle;
exports.connect = connect;
