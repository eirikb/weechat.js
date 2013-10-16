'use strict';

var data = '\u0019F00 default\u0019F01 black\u0019F02 darkgray\u0019F03 red\u0019F04 lightred\u0019F05 green\u0019F06 lightgreen\u0019F07 brown\u0019F08 yellow\u0019F09 blue \u0019F10 lightblue\u0019F11 magenta\u0019F12 lightmagenta\u0019F13 cyan\u0019F14 lightcyan\u0019F15 gray\u0019F16 white \u0019F13 cyan\u0019F11 magenta\u0019F05 green\u0019F07 brown\u0019F10 lightblue\u0019F00 default\u0019F14 lightcyan\u0019F12 lightmagenta\u0019F06 lightgreen \u0019F09 blue';

var colorMap = {
  'default': 255,
  black: 'black',
  darkgray: 'darkgray',
  red: 'darkred',
  lightred: 'red',
  green: 'darkgreen',
  lightgreen: 'lightgreen',
  brown: 'brown',
  yellow: 'yellow',
  blue: 'darkblue',
  lightblue: 'lightblue',
  magenta: 'darkmagenta',
  lightmagenta: 'magenta',
  cyan: 'darkcyan',
  lightcyan: 'lightcyan',
  gray: 'gray',
  white: 'white'
};

describe('Color', function() {
  it('should have X "parts"', function() {
    expect(weeChat.color.parse(data).length).toEqual(27);
  });

  it('should have no set background', function() {
    weeChat.color.parse(data).forEach(function(c) {
      expect(c.bg).toBeUndefined();
    });
  });

  it('should find every color in colorMap', function() {
    weeChat.color.parse(data).forEach(function(c) {
      var text = c.text.trim();
      expect(colorMap[text]).toEqual(c.fg);
    });
  });
});
