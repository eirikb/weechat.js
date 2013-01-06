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
var weechat = require('./weechat.js');

var client = new weechat.Client('localhost', 8000, 'test', function() {
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

Colorizing
---

At the moment the module return only pure WeeChat strings, including coding for colors.  
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

Interaction
---

__.send__ is used to send messages to WeeChat, like this:

```JavaScript
client.send('input irc.freenode.#weechat hello guys!');
```

Results are asynchronous:

```JavaScript
client.send('info version', function(version) {
    console.log('version is', version.value);
});
```

__.on__ is used for listeners, when an even occures in WeeChat.  
They can be added like this:  

```JavaScript
client.on('_buffer_line_added', function(line) {
    console.log('Got line', line);
});
```

Built in listeners
---
There are some built in aliases making listeners easier to add:  
__line__: New line added   
__open__: Buffer is opened  
__close__: Buffer is closing  
__renamed__: Buffer is renamed   
__localvar__: Local var is added  
__title__: Title (topic) is changed for a buffer  
__nicklist__: Nicklist
