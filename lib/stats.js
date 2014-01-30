"use strict";

var Redis = require('redis');

var Stats = function(config){

  config = config || {};

  this.prefix = '';

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

  this.redis = Redis.createClient(redisConfig);

};

Stats.prototype.quit = function(done){
  this.redis.quit();
  return done();
};

Stats.prototype.count = function(key){
  this.redis.incr(this.prefix + key);
};

module.exports = Stats;
