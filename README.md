WeeChat.js
===

weechat relay protocol module for Node.js

The weechat relay protocol can be found in npm

    npm install weechat

And can be used like this:

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
