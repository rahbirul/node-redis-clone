'use strict';

var storage = require('./storage');

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

module.exports = {
  get: get,
  set: set,
  exists: exists,
  del: del
};