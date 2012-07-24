WeeChat.js
===

[WeeChat Relay Protocol](http://www.weechat.org/files/doc/devel/weechat_relay_protocol.en.html) 
module for [Node.js](http://nodejs.org)

npm
---

    npm install weechat

Usage
---

```JavaScript
var WeeChat = require('weechat');

var weeChat = new WeeChat();
weeChat.connect('localhost', 8000, 'test', function(err) {
    if (!err) {
        console.log('Connected!');

        weeChat.write('info version', function(data) {
            console.log(data[0].value);
        });
        // Some commands are mapped
        weeChat.version(function(version) {
            console.log(version);
        });
    } else {
        console.log(err);
    }
});

weeChat.on(function(data, id){
    console.log(data, id);
});
```

Colorizing
---

At the moment the module return only pure WeeChat strings, including coding for colors.   
The module supports stripping these codes away using

```JavaScript
weeChat.style(line);
```

Will support real color parsing in the future.  
Note that since a WeeChat string can contain many styles it will be split into 'parts'.

Interaction
---

__.write__ is used to send messages to WeeChat, like this:

```JavaScript
weeChat.write('input irc.freenode.#weechat hello guys!');
```

Results are asynchronous:

```JavaScript
weeChat.write('info version', function(data) {
    console.log('key %s with value %s', data[0].key, data[0].value);
});

weeChat.write('_buffer_line_added', function(data) {
    console.log('Got lines', data);
});
```
