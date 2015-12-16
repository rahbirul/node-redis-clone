'use strict';

var _ = require('lodash'),
  storage = require('./storage');

var get = function (req, res) {
  var key = req.key;
  var value = storage.get(key);

  if (value === null) {
    res.nil();
  } else {
    res.bulk(value);
  }
};

var set = function (req, res) {
  storage.set(req.key, req.value);
  res.ok();
};


var exists = function (req, res) {
  res.number(storage.exists(req.key));
};

var del = function (req, res) {
  res.number(storage.del(req.key));
};

var incr = function (req, res) {
  var key = req.key;

  if (!storage.exists(key)) {
    storage.set(key, '1');
    res.number(1);
    return;
  }

  var currentValue = storage.get(key);
  if (_.isNaN(currentValue++)) {
    res.error('value is not an integer or out of range');
    return;
  }
  storage.set(key, currentValue);
  res.number(currentValue);
};

var decr = function (req, res) {
  var key = req.key;

  if (!storage.exists(key)) {
    storage.set(key, '-1');
    res.number(-1);
    return;
  }

  var currentValue = storage.get(key);
  if (_.isNaN(currentValue--)) {
    res.error('value is not an integer or out of range');
    return;
  }
  storage.set(key, currentValue);
  res.number(currentValue);
};

module.exports = {
  get: get,
  set: set,
  exists: exists,
  del: del,
  incr: incr,
  decr: decr
};