var assert = require('assert');
var color = require('../src/color.js');

var data = '\u0019F00 default\u0019F01 black\u0019F02 darkgray\u0019F03 red\u0019F04 lightred\u0019F05 green\u0019F06 lightgreen\u0019F07 brown\u0019F08 yellow\u0019F09 blue \u0019F10 lightblue\u0019F11 magenta\u0019F12 lightmagenta\u0019F13 cyan\u0019F14 lightcyan\u0019F15 gray\u0019F16 white \u0019F13 cyan\u0019F11 magenta\u0019F05 green\u0019F07 brown\u0019F10 lightblue\u0019F00 default\u0019F14 lightcyan\u0019F12 lightmagenta\u0019F06 lightgreen \u0019F09 blue';

var colorMap = {
  'default': '#000000',
  black: '#AA0000',
  darkgray: '#00AA00',
  red: '#AA5500',
  lightred: '#0000AA',
  green: '#AA00AA',
  lightgreen: '#00AAAA',
  brown: '#AAAAAA',
  yellow: '#555555',
  blue: '#FF5555',
  lightblue: '#55FF55',
  magenta: '#FFFF55',
  lightmagenta: '#5555FF',
  cyan: '#FF55FF',
  lightcyan: '#55FFFF',
  gray: '#FFFFFF',
  white: '#000000'
};

describe('color', function() {
  describe('WeeChat colors', function() {
    it('should have X "parts"', function() {
      assert.equal(27, color.parse(data).length);
    });

    it('should have no set background', function() {
      color.parse(data).forEach(function(c) {
        assert.equal(undefined, c.bg);
      });
    });

    it('should find every color in colorMap', function() {
      color.parse(data).forEach(function(c) {
        var text = c.text.trim();
        assert.equal(c.fg, colorMap[text]);
      });
    });
  });
});
