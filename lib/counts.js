"use strict";

var Redis = require('redis');
var async = require('async');
var _ = require('underscore');

var Counts = function(config, next){

  var self = this;

  config = config || {};

  this.prefix = '';
  this.length_keys = [];
  this.count_keys = [];

  this.lengths = {};
  this.counts = {};

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
  if(config.hasOwnProperty('lengths')){
    this.length_keys = config.lengths;
  }

  // workers use incr on these
  if(config.hasOwnProperty('counts')){
    this.count_keys = config.counts;
  }

  _.each(this.length_keys, function(key){
    self.lengths[key] = {
      value: 0,
      prev: 0,
      delta: 0
    };
  });

  _.each(this.count_keys, function(key){
    self.counts[key] = {
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


Counts.prototype.fetch_lengths = function(done){
  var self = this;

  var fetch_length = function(key, done){
    self.redis.llen(
      self.prefix + key,
      function(err, value){
        value = Number(value);
        if(!value){
          value = 0;
        }
        self.lengths[key].prev = self.lengths[key].value;
        self.lengths[key].delta = value - self.lengths[key].prev;
        self.lengths[key].value = value;
        done();
      });
  };

  async.each(self.length_keys, fetch_length, done);

};


Counts.prototype.fetch_counts = function(done){

  var self = this;

  var fetch_count = function(key, done){
    self.redis.get(
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

  async.each(this.count_keys, fetch_count, done);

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

  _.each(this.length_keys, function(key){
    var sign = (self.lengths[key].delta < 0 ) ? '' : '+';
    self.print(key, self.lengths[key].value, sign + self.lengths[key].delta + '/s');
  });

  console.log();

  _.each(self.count_keys, function(key){
    var sign = (self.counts[key].delta < 0) ? '' : '+';
    self.print(key, self.counts[key].value, sign + self.counts[key].delta + '/s');
  });

};

Counts.prototype.run = function(){
  var self = this;

  var run = function(){
    async.parallel([
      function(done){
        self.fetch_lengths(done);
      },
      function(done){
        self.fetch_counts(done);
      },
    ], function(){
      self.render();
      setTimeout(run, 1000);
    });
  };

  run();


};

module.exports = Counts;
