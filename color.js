// NOTE: This is a direct port of http://git.weechat.org/?p=qweechat.git;a=blob;f=src/qweechat/weechat/color.py
var util = require('util');

var RE_COLOR_ATTRS = '[*!/_|]*',
RE_COLOR_STD = util.format('(?:%s\\d{2})', RE_COLOR_ATTRS),
RE_COLOR_EXT = util.format('(?:@%s\\d{5})', RE_COLOR_ATTRS),
RE_COLOR_ANY = util.format('(?:%s|%s)', RE_COLOR_STD, RE_COLOR_EXT),
//# \x19: color code, \x1A: set attribute, \x1B: remove attribute, \x1C: reset
RE_COLOR = util.format('(\\x19(?:\\d{2}|F%s|B\\d{2}|B@\\d{5}|\\\\*%s(,%s)?|@\\d{5}|b.|\\x1C))|\\x1A.|\\x1B.|\\x1C', RE_COLOR_ANY, RE_COLOR_ANY, RE_COLOR_ANY);

var TERMINAL_COLORS = '000000cd000000cd00cdcd000000cdcd00cd00cdcde5e5e54d4d4dff000000ff00ffff000000ffff00ff00ffffffffff\
00000000002a0000550000800000aa0000d4002a00002a2a002a55002a80002aaa002ad400550000552a005555005580\
0055aa0055d400800000802a0080550080800080aa0080d400aa0000aa2a00aa5500aa8000aaaa00aad400d40000d42a\
00d45500d48000d4aa00d4d42a00002a002a2a00552a00802a00aa2a00d42a2a002a2a2a2a2a552a2a802a2aaa2a2ad4\
2a55002a552a2a55552a55802a55aa2a55d42a80002a802a2a80552a80802a80aa2a80d42aaa002aaa2a2aaa552aaa80\
2aaaaa2aaad42ad4002ad42a2ad4552ad4802ad4aa2ad4d455000055002a5500555500805500aa5500d4552a00552a2a\
552a55552a80552aaa552ad455550055552a5555555555805555aa5555d455800055802a5580555580805580aa5580d4\
55aa0055aa2a55aa5555aa8055aaaa55aad455d40055d42a55d45555d48055d4aa55d4d480000080002a800055800080\
8000aa8000d4802a00802a2a802a55802a80802aaa802ad480550080552a8055558055808055aa8055d480800080802a\
8080558080808080aa8080d480aa0080aa2a80aa5580aa8080aaaa80aad480d40080d42a80d45580d48080d4aa80d4d4\
aa0000aa002aaa0055aa0080aa00aaaa00d4aa2a00aa2a2aaa2a55aa2a80aa2aaaaa2ad4aa5500aa552aaa5555aa5580\
aa55aaaa55d4aa8000aa802aaa8055aa8080aa80aaaa80d4aaaa00aaaa2aaaaa55aaaa80aaaaaaaaaad4aad400aad42a\
aad455aad480aad4aaaad4d4d40000d4002ad40055d40080d400aad400d4d42a00d42a2ad42a55d42a80d42aaad42ad4\
d45500d4552ad45555d45580d455aad455d4d48000d4802ad48055d48080d480aad480d4d4aa00d4aa2ad4aa55d4aa80\
d4aaaad4aad4d4d400d4d42ad4d455d4d480d4d4aad4d4d40808081212121c1c1c2626263030303a3a3a4444444e4e4e\
5858586262626c6c6c7676768080808a8a8a9494949e9e9ea8a8a8b2b2b2bcbcbcc6c6c6d0d0d0dadadae4e4e4eeeeee';

//# WeeChat basic colors (color name, index in terminal colors)
var WEECHAT_BASIC_COLORS = [['default', 0], ['black', 0], ['darkgray', 8], ['red', 1], ['lightred', 9], ['green', 2], ['lightgreen', 10], ['brown', 3], ['yellow', 11], ['blue', 4], ['lightblue', 12], ['magenta', 5], ['lightmagenta', 13], ['cyan', 6], ['lightcyan', 14], ['gray', 7], ['white', 0]];

function int(s) {
    return Math.floor(parseInt(s, 10));
}

function _rgb_color(index) {
    var color = TERMINAL_COLORS.slice(index * 6, (index * 6) + 6),
    r = int(color.slice(0, 2), 16) * 0.85,
    g = int(color.slice(2, 4), 16) * 0.85,
    b = int(color.slice(4, 6), 16) * 0.85;
    return util.format('%02x%02x%02x', r, g, b);
}

function _convert_weechat_color(color) {
    try {
        var index = int(color);
        return util.format('\x01(Fr%s)', color_options[index]);
    } catch(e) {
        console.error('Error decoding WeeChat color "%s"', color, e);
        return '';
    }
}

function _convert_terminal_color(fg_bg, attrs, color) {
    try {
        var index = int(color);
        return util.format('\x01(%s%s#%s)', fg_bg, attrs, _rgb_color(index));
    } catch(e) {
        console.error('Error decoding terminal color "%s"', color, e);
        return '';
    }
}

function _convert_color_attr(fg_bg, color) {
    var extended = false;
    if (color[0].match(/^@/)) {
        extended = true;
        color = color.slice(1);
    }
    var attrs = '';
    var keep_attrs = false;
    while (['*', '!', '/', '_', '|'].indexOf(color[0]) >= 0) {
        if (color[0] === '|') {
            keep_attrs = true;
        }
        attrs += color[0];
        color = color.slice(1);
    }
    if (extended) {
        return _convert_terminal_color(fg_bg, attrs, color);
    }
    try {
        var index = int(color);
        return _convert_terminal_color(fg_bg, attrs, WEECHAT_BASIC_COLORS[index][1]);
    } catch(e) {
        console.error('Error decoding color "%s"', color);
        return '';
    }
}

function _attrcode_to_char(code) {
    var codes = {
        '\x01': '*',
        '\x02': '!',
        '\x03': '/',
        '\x04': '_'
    };
    return codes[code];
}

function _convert_color(match, i) {
    var color = match[i];
    if (!color) {
        return '';
    }
    if (color[0] === '\x19') {
        if (color[1] === 'b') {
            //# bar code, ignored
            return '';
        } else if (color[1] === '\x1C') {
            //# reset
            return '\x01(Fr)\x01(Br)';
        } else if (['F', 'B'].indexOf(color[1]) >= 0) {
            //# foreground or background
            return _convert_color_attr(color[1], color.slice(2));
        } else if (color[1] === '*') {
            //# foreground with optional background
            var items = color.slice(2).split(',');
            var s = _convert_color_attr('F', items[0]);
            if (items.length > 1) {
                s += _convert_color_attr('B', items[1]);
            }
            return s;
        } else if (color[1] === '@') {
            //# direct ncurses pair number, ignored
            return '';
        }
        if (!isNaN(parseInt(color.sliec(1), 10))) {
            return _convert_weechat_color(int(color.slice(1)));
        }
        //# color code
        //pass
    } else if (color[0] === '\x1A') {
        //# set attribute
        return util.format('\x01(+%s)', _attrcode_to_char(color[1]));
    } else if (color[0] === '\x1B') {
        //# remove attribute
        return util.format('\x01(-%s)', _attrcode_to_char(color[1]));
    } else if (color[0] === '\x1C') {
        //# reset
        return '\x01(Fr)\x01(Br)';
    }
    //# should never be executed!
    return match[i];
}

exports.parse = function(text) {
    var r, rm, i, m;

    r = new RegExp(RE_COLOR);
    rm = r.exec(text);
    if (rm) {
        for (i = 0; i < rm.length; i++) {
            m = _convert_color(rm, i);
            text = text.replace(r, m, 1);
        }
    }
    return text;
};

