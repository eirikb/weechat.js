WeeChat.js
===

[WeeChat Relay Protocol](http://www.weechat.org/files/doc/devel/weechat_relay_protocol.en.html) 
module for [Node.js](http://nodejs.org)

npm
---

    npm install weechat

Usage
---

    var weechat = requrie('weechat');

    // Can only connect to localhost
    // First argument is port, second is password
    weechat.connect(8000, 'test', function(ok) {
        if (ok) {
            console.log('Connected!');

            weechat.write('info version', function(version) {
                console.log('WeeChat version', version);
            });
        }
    });

    weechat.on('_buffer_line_added', function(line) {
        console.log('Got a line!', line);
    });
