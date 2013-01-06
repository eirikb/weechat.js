WeeChat.js
===

[WeeChat Relay Protocol](http://www.weechat.org/files/doc/devel/weechat_relay_protocol.en.html) 
module for [Node.js](http://nodejs.org)

npm
---

    npm install weechat

Usage
---

__.connect(host, port, password, [callback])__  
Connect to WeeChat:

```JavaScript
var client = weechat.connect('localhost', 8000, 'test', function() {
    console.log('Connected!');
});
```

__.send(message, [callbakc])__  
Send messages to WeeChat:

```JavaScript
client.send('input irc.freenode.#weechat hello guys!');

client.send('info version', function(version) {
    console.log(version.value);
});
```

__.on([type], callback)__ 
Listeners, when an even occures in WeeChat:

```JavaScript
client.on('_buffer_line_added', function(line) {
    console.log('Got line', line);
});

client.on(function() {
    console.log('Anything happened', arguments);
});

client.on('line', function(line) {
    console.log('Got line', line);
});
```

__Built in listeners__  
There are some built in aliases making listeners easier to add:  
__line__: New line added   
__open__: Buffer is opened  
__close__: Buffer is closing  
__renamed__: Buffer is renamed   
__localvar__: Local var is added  
__title__: Title (topic) is changed for a buffer  
__nicklist__: Nicklist

Colorizing
---

The module return only pure WeeChat strings, including coding for colors.  
Calling `weechat.style(line);` will return an array of `parts`, like this:
```JavaScript
[ { text: 'Hello', fg: 'dark cyan', bg: undefined, attrs: [] },
  { text: 'world!' } ]
```

`fg` is foreground color, `bg` is background color, `attrs` is an array of attributes, such as underline.

The module supports stripping these codes away, returning a plain string, like this:
```JavaScript
weechat.noStyle(line);
```

Full example
---

```JavaScript
var weechat = require('./weechat.js');

var client = weechat.Client('localhost', 8000, 'test', function() {
    console.log('Connected!');

    client.send('info version', function(version) {
        console.log(version.value);
    });
});

client.on('error', function(err) {
    console.error(err);
});

client.on('end', function() {
    console.log('end');
});

client.on('line', function(line) {
    var from = weechat.noStyle(line.prefix);
    var message = weechat.noStyle(line.message);

    console.log(from, message);
});
```
