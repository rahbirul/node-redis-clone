'use strict';

var util = require('util'),
  _ = require('lodash'),
  config = require('./config');

var CommandParseError = function (msg) {
  this.message = msg;
};

util.inherits(CommandParseError, Error);


var parseSET = function (input) {
  return {key: input[1], value: input[3]};
};

var parseDELETE = function (input) {
  if (input.length === 2) {
    return input[1];
  }
  var keys = [];
  for (var i = 0; i < input.length; i += 2) {
    keys.push(input[i+1]);
  }
  return keys;
};

var parseGET = function (input) {
  return input[1];
};

var parseEXISTS = function (input) {
  return parseGET(input);
};

var parseINCR = function (input) {
  return parseGET(input);
};

var parseDECR = function (input) {
  return parseGET(input);
};

var CommandParser = function () {};

CommandParser.parse = function (buffer) {
  /*
    TODO - Refactor to parse the request from buffer without explicit string conversion,
    current approach is inefficient and hacky
  */

  var input = buffer.toString().split(config.EOL);
  if (_.last(input) === '') {
    input.pop();
  }

  // var bulkArrayLength = parseInt(input[0].replace('*', ''), 10);
  // var cmdLength = parseInt(input[1].replace('*', ''));

  var cmd = input[2];
  var data = input.slice(3);
  var key, value;

  var parsers = {
    'GET': parseGET,
    'DEL': parseDELETE,
    'EXISTS': parseEXISTS,
    'INCR': parseINCR,
    'DECR': parseDECR
  };

  if (cmd === 'SET') {
    var parsed = parseSET(data);
    key = parsed.key;
    value = parsed.value;
  }
  else if (cmd === 'QUIT') {
    return {cmd: cmd};
  }
  else {
    var parserFn = parsers[cmd];
    if (parserFn === undefined) {
      throw new CommandParseError('Unsupported operation requested');
    }
    key = parserFn(data);
  }

  return {cmd: cmd, key: key, value: value};
};

module.exports = {
  CommandParser: CommandParser,
  CommandParseError: CommandParseError
};