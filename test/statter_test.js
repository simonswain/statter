"use strict";

var statter = require('../index.js');

exports['statter'] = {
  setUp: function(callback) {
    this.__log = console.log;
    console.log = function(){};
    callback();
  },
  tearDown: function(callback) {
    console.log = this.__log;
    callback();
  },
  'exports': function(test) {
    test.expect(1);
    test.equal( typeof statter, 'object');
    test.done();
  }
};
