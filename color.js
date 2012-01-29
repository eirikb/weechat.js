// This module is a mess! Have to be fixed in the future.
//
var colors = [['default', 0], ['black', 0], ['darkgray', 8], ['red', 1], ['lightred', 9], ['green', 2], ['lightgreen', 10], ['brown', 3], ['yellow', 11], ['blue', 4], ['lightblue', 12], ['magenta', 5], ['lightmagenta', 13], ['cyan', 6], ['lightcyan', 14], ['gray', 7], ['white', 0]];

var part, style;

function indexOf(line, regex, startpos) {
    var index = line.slice(startpos || 0).search(regex);
    return index >= 0 ? index + (startpos || 0) : index;
}

function parts(line) {
    var s, i = 0,
    j = - 1,
    all = [],
    r = /\x19|\x1a|\x1c/;

    while ((i = indexOf(line, r, i)) >= 0) {
        if (j >= 0) {
            all.push(line.slice(j, i));
        }
        j = i;
        i++;
    }
    s = line.slice(j, line.length);
    if (s.length > 0) {
        all.push(s);
    }
    return all;
}

function rgbColor(index) {
    return terminalColors.slice(index * 6, (index * 6) + 6);
}

function convertColorAttr() {
    var s;
    part = part.slice(2);
    if (part[0].match(/^@/)) {
        part = part.slice(1);
    }
    while (['*', '!', '/', '_', '|'].indexOf(part[0]) >= 0) {
        part = part.slice(1);
    }
    s = colors[parseInt(part.slice(0, 2), 10)][0];
    part = part.slice(2);
    return s;
}

function setAttribute() {
    var attr = {
        '\x01': 'bold',
        '\x02': '!',
        '\x03': '/',
        '\x04': 'underline'
    } [part[1]];
    style.attrs.push(attr);
    part = part.slice(2);
}

function getStyle() {
    if (!style.attrs) {
        style.attrs = [];
    }

    if (part[0] === '\x19') {
        if (part[1] === '\x1c') {
            style = {};
        } else if (part[1] === 'F') {
            style.fg = convertColorAttr();
        } else if (part[1] === 'B') {
            style.bg = convertColorAttr();
        }
    } else if (part[0] === '\x1a') {
        setAttribute();
    } else if (part[0] === '\x1b') {
        removeAttribute();
    } else if (part[0] === '\x1c') {
        style = {};
    }
    return style;
}

exports.parse = function(line) {
    style = {};
    return parts(line).map(function(p) {
        var k, s = {};
        part = p;
        getStyle();
        for (k in style) {
            s[k] = style[k];
        }
        return {
            part: part,
            style: s
        };
    }).filter(function(p) {
        return p.part.length > 0;
    });
};

