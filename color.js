var terminalColors = '000000cd000000cd00cdcd000000cdcd00cd00cdcde5e5e54d4d4dff000000ff00ffff000000ffff00ff00ffffffffff \
    00000000002a0000550000800000aa0000d4002a00002a2a002a55002a80002aaa002ad400550000552a005555005580 \
    0055aa0055d400800000802a0080550080800080aa0080d400aa0000aa2a00aa5500aa8000aaaa00aad400d40000d42a \
    00d45500d48000d4aa00d4d42a00002a002a2a00552a00802a00aa2a00d42a2a002a2a2a2a2a552a2a802a2aaa2a2ad4 \
    2a55002a552a2a55552a55802a55aa2a55d42a80002a802a2a80552a80802a80aa2a80d42aaa002aaa2a2aaa552aaa80 \
    2aaaaa2aaad42ad4002ad42a2ad4552ad4802ad4aa2ad4d455000055002a5500555500805500aa5500d4552a00552a2a \
    552a55552a80552aaa552ad455550055552a5555555555805555aa5555d455800055802a5580555580805580aa5580d4 \
    55aa0055aa2a55aa5555aa8055aaaa55aad455d40055d42a55d45555d48055d4aa55d4d480000080002a800055800080 \
    8000aa8000d4802a00802a2a802a55802a80802aaa802ad480550080552a8055558055808055aa8055d480800080802a \
    8080558080808080aa8080d480aa0080aa2a80aa5580aa8080aaaa80aad480d40080d42a80d45580d48080d4aa80d4d4 \
    aa0000aa002aaa0055aa0080aa00aaaa00d4aa2a00aa2a2aaa2a55aa2a80aa2aaaaa2ad4aa5500aa552aaa5555aa5580 \
    aa55aaaa55d4aa8000aa802aaa8055aa8080aa80aaaa80d4aaaa00aaaa2aaaaa55aaaa80aaaaaaaaaad4aad400aad42a \
    aad455aad480aad4aaaad4d4d40000d4002ad40055d40080d400aad400d4d42a00d42a2ad42a55d42a80d42aaad42ad4 \
    d45500d4552ad45555d45580d455aad455d4d48000d4802ad48055d48080d480aad480d4d4aa00d4aa2ad4aa55d4aa80 \
    d4aaaad4aad4d4d400d4d42ad4d455d4d480d4d4aad4d4d40808081212121c1c1c2626263030303a3a3a4444444e4e4e \
    5858586262626c6c6c7676768080808a8a8a9494949e9e9ea8a8a8b2b2b2bcbcbcc6c6c6d0d0d0dadadae4e4e4eeeeee';

var colors = ['black', 'red', 'green', 'brown', 'blue', 'magenta', 'cyan', 'gray', 'darkgray', 'lightred', 'lightgreen', 'yellow', 'lightblue', 'lightmagenta', 'lightcyan'];

function rgbColor(index) {
    return terminalColors.slice(index * 6, (index * 6) + 6);
}

exports.parse = function(line) {
    var def = colors[0],
    r = /\x19/,
    parts = line.split(r);

    if (parts.length > 1) {
        parts = parts.slice(1).map(function(part) {
            var n = parseInt(part.slice(0, 2), 10),
            color = colors[n];
            if (!color) {
                color = rgbColor(n);
            }
            return {
                part: part.slice(2),
                color: color
            };
        });
    } else {
        parts = [{
            color: def,
            part: line
        }];
    }
    return parts;
};

