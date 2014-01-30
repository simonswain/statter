# Statter

```
var statter = require('statter');
var stats = new statter.Stats();
```

```
stats.count('foo');
```


## usage

Record counts from in your app. Handy for telling how fast things are
being processed.

```javascript
var statter = require('../index.js');

var stats = new statter.Stats();

setInterval(function(){
  console.log(new Date().getTime());
  stats.count('my-count');
}, 1000);
```

`lengths` are the number of elements in the Redis Lists your app is
using. Handy to see how far message queues are backing up.

```
LPUSH my-list foo
```


Create a realtime display

```javascript
var statter = require('../index.js');

var counts = new statter.Counts({
  lengths: [
    'my-list', 
  ],
  counts: [
    'my-count'
  ]
}).run();
```

From `examples/counts.js` this demo gives a simple display that
updates once per second in your terminal.

```bash
Thu Jan 30 2014 20:45:01 GMT+1100 (EST)

my-list                        2        +0/s

my-count                       3568     +1/s
```

# Config

You can pass in an object with settings.

`prefix` will be prepended to your keys, with a : separator (e.g
`my-prefix:my-key`).

`redis` lets you tell Statter where Redis is. Default is
localhost:6379.

```javasctips
var stats = new statter.Stats({
  prefix: 'my-prefix',
  redis: {
    host: '127.0.0.1',
    port: 6379,
    prefix: ''
  }
});

```