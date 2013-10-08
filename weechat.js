(function(exports) {// http://weechat.org/files/doc/devel/weechat_dev.en.html#color_codes_in_strings

(function() {
  var part, fg, bg, attrs;

  // XTerm 8-bit pallete
  var colors = [
      '#000000', '#AA0000', '#00AA00', '#AA5500', '#0000AA',
      '#AA00AA', '#00AAAA', '#AAAAAA', '#555555', '#FF5555',
      '#55FF55', '#FFFF55', '#5555FF', '#FF55FF', '#55FFFF',
      '#FFFFFF', '#000000', '#00005F', '#000087', '#0000AF',
      '#0000D7', '#0000FF', '#005F00', '#005F5F', '#005F87',
      '#005FAF', '#005FD7', '#005FFF', '#008700', '#00875F',
      '#008787', '#0087AF', '#0087D7', '#00AF00', '#00AF5F',
      '#00AF87', '#00AFAF', '#00AFD7', '#00AFFF', '#00D700',
      '#00D75F', '#00D787', '#00D7AF', '#00D7D7', '#00D7FF',
      '#00FF00', '#00FF5F', '#00FF87', '#00FFAF', '#00FFD7',
      '#00FFFF', '#5F0000', '#5F005F', '#5F0087', '#5F00AF',
      '#5F00D7', '#5F00FF', '#5F5F00', '#5F5F5F', '#5F5F87',
      '#5F5FAF', '#5F5FD7', '#5F5FFF', '#5F8700', '#5F875F',
      '#5F8787', '#5F87AF', '#5F87D7', '#5F87FF', '#5FAF00',
      '#5FAF5F', '#5FAF87', '#5FAFAF', '#5FAFD7', '#5FAFFF',
      '#5FD700', '#5FD75F', '#5FD787', '#5FD7AF', '#5FD7D7',
      '#5FD7FF', '#5FFF00', '#5FFF5F', '#5FFF87', '#5FFFAF',
      '#5FFFD7', '#5FFFFF', '#870000', '#87005F', '#870087',
      '#8700AF', '#8700D7', '#8700FF', '#875F00', '#875F5F',
      '#875F87', '#875FAF', '#875FD7', '#875FFF', '#878700',
      '#87875F', '#878787', '#8787AF', '#8787D7', '#8787FF',
      '#87AF00', '#87AF5F', '#87AF87', '#87AFAF', '#87AFD7',
      '#87AFFF', '#87D700', '#87D75F', '#87D787', '#87D7AF',
      '#87D7D7', '#87D7FF', '#87FF00', '#87FF5F', '#87FF87',
      '#87FFAF', '#87FFD7', '#87FFFF', '#AF0000', '#AF005F',
      '#AF0087', '#AF00AF', '#AF00D7', '#AF00FF', '#AF5F00',
      '#AF5F5F', '#AF5F87', '#AF5FAF', '#AF5FD7', '#AF5FFF',
      '#AF8700', '#AF875F', '#AF8787', '#AF87AF', '#AF87D7',
      '#AF87FF', '#AFAF00', '#AFAF5F', '#AFAF87', '#AFAFAF',
      '#AFAFD7', '#AFAFFF', '#AFD700', '#AFD75F', '#AFD787',
      '#AFD7AF', '#AFD7D7', '#AFD7FF', '#AFFF00', '#AFFF5F',
      '#AFFF87', '#AFFFAF', '#AFFFD7', '#AFFFFF', '#D70000',
      '#D7005F', '#D70087', '#D700AF', '#D700D7', '#D700FF',
      '#D75F00', '#D75F5F', '#D75F87', '#D75FAF', '#D75FD7',
      '#D75FFF', '#D78700', '#D7875F', '#D78787', '#D787AF',
      '#D787D7', '#D787FF', '#D7AF00', '#D7AF5F', '#D7AF87',
      '#D7AFAF', '#D7AFD7', '#D7AFFF', '#D7D700', '#D7D75F',
      '#D7D787', '#D7D7AF', '#D7D7D7', '#D7D7FF', '#D7FF00',
      '#D7FF5F', '#D7FF87', '#D7FFAF', '#D7FFD7', '#D7FFFF',
      '#FF0000', '#FF005F', '#FF0087', '#FF00AF', '#FF00D7',
      '#FF00FF', '#FF5F00', '#FF5F5F', '#FF5F87', '#FF5FAF',
      '#FF5FD7', '#FF5FFF', '#FF8700', '#FF875F', '#FF8787',
      '#FF87AF', '#FF87D7', '#FF87FF', '#FFAF00', '#FFAF5F',
      '#FFAF87', '#FFAFAF', '#FFAFD7', '#FFAFFF', '#FFD700',
      '#FFD75F', '#FFD787', '#FFD7AF', '#FFD7D7', '#FFD7FF',
      '#FFFF00', '#FFFF5F', '#FFFF87', '#FFFFAF', '#FFFFD7',
      '#FFFFFF', '#080808', '#121212', '#1C1C1C', '#262626',
      '#303030', '#3A3A3A', '#444444', '#4E4E4E', '#585858',
      '#626262', '#6C6C6C', '#767676', '#808080', '#8A8A8A',
      '#949494', '#9E9E9E', '#A8A8A8', '#B2B2B2', '#BCBCBC',
      '#C6C6C6', '#D0D0D0', '#DADADA', '#E4E4E4', '#EEEEEE'
  ];

  function setAttrs() {
    while (part.match(/^[\*\/\_\|]/)) {
      attrs.push(part.charAt(0));
      part = part.slice(1);
    }
  }

  function getColor() {
    var c;
    if (part.match(/^@/)) {
      c = part.slice(1, 6);
      part = part.slice(6);
    } else {
      c = part.slice(0, 2);
      part = part.slice(2);
    }
    return c;
  }

  var prefixes = {
    '\x19': function() {
      if (part.match(/^F/)) {
        part = part.slice(1);
        setAttrs();
        fg = getColor();
      } else if (part.match(/^B/)) {
        part = part.slice(1);
        setAttrs();
        bg = getColor();
      } else {
        setAttrs();
        fg = getColor();
        if (part.match(/^,/)) {
          part = part.slice(1);
          bg = getColor();
        }
      }
    },
    '\x1A': function() {
      // Don't know what to do
    },
    '\x1B': function() {
      attrs = [];
    },
    '\x1C': function() {
      fg = '';
      bg = '';
    }
  };

  function parse(text) {
    if (!text) {
      return text;
    }
    var f, parts = text.split(/(\x19|\x1A|\x1B|\x1C)/);
    if (parts.length === 1) return [{
        text: parts[0]
      }];
    attrs = [];

    return parts.map(function(p) {
      var res, tmp = prefixes[p.charAt(0)];
      if (f) {
        part = p;
        f();
        res = {
          text: part,
          fg: colors[parseInt(fg, 10)],
          bg: colors[parseInt(bg, 10)],
          attrs: attrs
        };
        if (!res.fg) res.fg = fg;
        if (!res.bg) res.bg = bg;
      }
      f = tmp;
      return res;
    }).filter(function(p) {
      return p;
    });
  }

  exports.color = parse;
})();
;(function() {
  var zlib;
  if (this.require) {
    zlib = require('zlib');
  }

  function Parser(cb) {
    var self = this;
    var buffer = new Buffer(0);
    var total = 0;
    var unzipping = false;
    var protocol = new Protocol();

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
        if (!zlib) {
          throw new Error('Zlib is currently not available');
        }
        unzipping = true;
        zlib.unzip(data, function(err, data) {
          unzipping = false;
          if (err) throw err;
          parseData(data);
          self.onData();
        });
      } else {
        parseData(data);
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

      // Need at least 1 int (4 bytes) in buffer
      if (!unzipping && buffer.length > 4) {
        if (total === 0) {
          protocol.setData(buffer);
          total = protocol.getInt();
        }

        // Ready to parse buffer
        if (buffer.length >= total) {
          data = buffer.slice(0, total);
          buffer = buffer.slice(total);
          total = 0;
          handleData(data);
        }
      }
    };
  }

  exports.Parser = Parser;
})();
;//  http://www.weechat.org/files/doc/devel/weechat_relay_protocol.en.html

(function() {
  function loop(range, cb) {
    var i;
    for (i = 0; i < range; i++) {
      cb(i);
    }
  }

  function Protocol() {
    var self = this;
    var data;
    var types = {
      chr: getChar,
      'int': getInt,
      // hacks
      lon: getPointer,
      str: getString,
      buf: getBuffer,
      ptr: getPointer,
      // hacks
      tim: getPointer,
      htb: getHashtable,
      hda: getHdata,
      inf: getInfo,
      inl: getInfolist,
      arr: array
    };

    // Map all types to exports
    Object.keys(types).forEach(function(name) {
      var type = types[name];
      self[type.name] = type;
    });

    function runType(type) {
      if (types[type]) {
        return types[type]();
      } else {
        console.log(type);
        //throw new Error('Unknown type: ' + type);
      }
    }

    function getChar() {
      var c = data[0];
      data = data.slice(1);
      return c;
    }

    function getInt() {
      var i = ((data[0] & 0xff) << 24) | ((data[1] & 0xff) << 16) | ((data[2] & 0xff) << 8) | (data[3] & 0xff);
      data = data.slice(4);
      return i >= 0 ? i : null;
    }

    function getString() {
      var l = getInt();
      var s = data.slice(0, l);

      data = data.slice(l);
      return s.toString();
    }

    function getBuffer() {
      throw 'Type not implemented: Buffer';
    }

    function getPointer() {
      var l = data[0];
      var pointer = data.slice(1, l + 1);

      data = data.slice(l + 1);
      return pointer.toString();
    }

    function getHashtable() {
      var typeKeys = getType();
      var typeValues = getType();
      var count = getInt();
      var obj = {};

      loop(count, function() {
        obj[types[typeKeys]()] = runType(typeValues);
      });
      return obj;
    }

    function getHdata() {
      var keys;
      var paths;
      var count;
      var objs = [];
      var hpath = getString();

      keys = getString().split(',');
      paths = hpath.split('/');
      count = getInt();

      keys = keys.map(function(key) {
        return key.split(':');
      });

      loop(count, function() {
        var tmp = {};
        // TODO: Why is path not used here?
        tmp.pointers = paths.map(function(path) {
          return getPointer();
        });
        keys.forEach(function(key) {
          tmp[key[0]] = runType(key[1]);
        });
        objs.push(tmp);
      });
      return objs;
    }

    function getInfo() {
      return {
        key: getString(),
        value: getString()
      };
    }

    function getType() {
      var t = data.slice(0, 3);
      data = data.slice(3);
      return t;
    }

    function getInfolist() {
      throw 'Type not implemented: infolist';
    }

    function array() {
      var type;
      var count;
      var values;

      type = getType();
      count = getInt();
      values = [];
      loop(count, function() {
        values.push(runType(type));
      });
      return values;
    }

    self.setData = function(d) {
      data = d;
    };

    self.getData = function() {
      return data;
    };

    self.parse = function() {
      if (data.length < 3) {
        return null;
      }
      return runType(getType());
    };
  }

  exports.Protocol = Protocol;
})();
})(typeof exports === "undefined" ? this.weechat = {} : exports)