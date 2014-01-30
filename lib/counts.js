"use strict";

var Redis = require('redis');
var async = require('async');
var _ = require('underscore');

var Counts = function(config, next){

  var self = this;

  config = config || {};

  this.prefix = '';
  this.count_keys = [];
  this.value_keys = [];

  this.counts = {};
  this.values = {};

  var redisConfig = {
    host: '127.0.0.1',
    port: 6379
  };

  if(config.hasOwnProperty('redis')){
    redisConfig = config.redis;
  }

  if(config.hasOwnProperty('prefix')){
    this.prefix = config.prefix;
  }

  if(this.prefix !== ''){
    this.prefix = this.prefix + ':';
  }

  // get the llen of these
  if(config.hasOwnProperty('counts')){
    this.count_keys = config.counts;
  }

  // workers use incr on these
  if(config.hasOwnProperty('prefix')){
    this.value_keys = config.values;
  }

  _.each(this.count_keys, function(key){
    self.counts[key] = {
      value: 0,
      prev: 0,
      delta: 0
    };
  });

  _.each(this.value_keys, function(key){
    self.values[key] = {
      value: 0,
      prev: 0,
      delta: 0
    };
  });

  this.redis = Redis.createClient(redisConfig);

  return this;

};

Counts.prototype.quit = function(done){
  this.redis.quit();
  return done();
};


Counts.prototype.cls = function(){
  process.stdout.write('\u001B[2J\u001B[0;0f');
};


Counts.prototype.fetch_counts = function(done){
  var self = this;

  var fetch_count = function(key, done){
    self.redis.llen(
      self.prefix + key,
      function(err, value){
        value = Number(value);
        if(!value){
          value = 0;
        }
        self.counts[key].prev = self.counts[key].value;
        self.counts[key].delta = value - self.counts[key].prev;
        self.counts[key].value = value;
        done();
      });
  };

  async.each(self.count_keys, fetch_count, done);

};


Counts.prototype.fetch_values = function(done){

  var self = this;

  var fetch_value = function(key, done){
    self.redis.get(
      self.prefix + key,
      function(err, value){
        value = Number(value);
        if(!value){
          value = 0;
        }
        self.values[key].prev = self.values[key].value;
        self.values[key].delta = value - self.values[key].prev;
        self.values[key].value = value;
        done();
      });
  };

  async.each(this.value_keys, fetch_value, done);

};

Counts.prototype.print = function(k, v, d){
  var pad = '                             ';
  console.log(k + pad.substr(0, 30-k.length) + ' ' + v + pad.substr(0, 8-String(v).length) + ' ' + d);
};

Counts.prototype.render = function(){
  var self = this;
  this.cls();
  console.log(new Date());
  console.log();

  _.each(this.count_keys, function(key){
    var sign = (self.counts[key].delta < 0 ) ? '' : '+';
    self.print(key, self.counts[key].value, sign + self.counts[key].delta + '/s');
  });

  console.log();

  _.each(self.value_keys, function(key){
    var sign = (self.values[key].delta < 0) ? '' : '+';
    self.print(key, self.values[key].value, sign + self.values[key].delta + '/s');
  });

};

Counts.prototype.run = function(){
  var self = this;

  var run = function(){
    async.parallel([
      function(done){
        self.fetch_counts(done);
      },
      function(done){
        self.fetch_values(done);
      },
    ], function(){
      self.render();
      setTimeout(run, 1000);
    });
  };

  run();


};

module.exports = Counts;
