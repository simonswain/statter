var statter = require('../index.js');

var stats = new statter.Stats();

setInterval(function(){
  console.log(new Date().getTime());
  stats.count('my-count');
}, 1000)

