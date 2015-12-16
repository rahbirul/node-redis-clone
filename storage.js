'use strict';

var stores = [],
  dbIndex = 0;

stores[dbIndex] = {};

/*
  TODO - Implement disk persistence between server process reloads, support multiple dbs
*/

var exists = function (key) {
  return (stores[dbIndex][key] !== undefined) ? 1 : 0;
};

var del = function (keys) {
  var deleted = 0;
  if (typeof(keys) === 'string') {
    if (exists(keys)) {
      deleted++;
    }
    delete stores[dbIndex][keys];
  } else {
    keys.forEach(function (key) {
    if (exists(key)) {
      deleted++;
      delete stores[dbIndex][key];
    }
  });
  }

  return deleted;
};

var get = function(key) {
  return stores[dbIndex][key] || null;
};

var set = function(key, value) {
  stores[dbIndex][key] = value;
};

module.exports = {
  del: del,
  exists: exists,
  get: get,
  set: set
};