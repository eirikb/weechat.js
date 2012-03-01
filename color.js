// http://weechat.org/files/doc/devel/weechat_dev.en.html#color_codes_in_strings
var part, fg, bg, attrs = [],
colors = ['', 'black', 'dark gray', 'dark red', 'light red', 'dark green', 'light green', 'brown', 'yellow', 'dark blue', 'light blue', 'dark magenta', 'light magenta', 'dark cyan', 'light cyan', 'gray', 'white'];

function setAttrs() {
    while (part.match(/^\*|^\/|^\_|^\|/)) {
        attrs.push(part.charAt(0));
        part = part.slice(1);
    }
}

function getColor() {
    var c;
    if (part.match(/^@/)) {
        c = part.slice(1, 5);
        part = part.slice(5);
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
        }
    },
    '\x1A': function(part) {
        console.log('Awesome! 2', part);
    },
    '\x1B': function(part) {
        console.log('Awesome! 3', part);
    },
    '\x1C': function(part) {
        console.log('Awesome! 4', part);
    }
};

exports.parse = function(text) {
    if (!text) {
        console.log('ERROR!', text);
        return text;
    }
    var f, parts = text.split(/(\x19|\x1A|\x1B|\x1C)/);

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
};

