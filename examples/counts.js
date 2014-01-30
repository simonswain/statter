var statter = require('../index.js');

var counts = new statter.Counts({
  lengths: [
    'my-list', 
  ],
  counts: [
    'my-count'
  ]
}).run();
