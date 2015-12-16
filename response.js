'use strict';

var config = require('./config');

var ResponseGenerator = function (socket) {
  this._socket = socket;
};

ResponseGenerator.prototype = {

  constructor: ResponseGenerator,

  send: function (data) {
    this._socket.write(data + config.EOL);
  },

  ok: function () {
    this.send('+OK');
  },
  bulk: function(data) {
      this.send('$' + data.toString().length);
      this.send(data);
  },

  error: function(msg) {
    this.send('-ERR ' + msg);
  },

  number: function(num) {
    this.send(":" + num);
  },

  nil: function() {
    this.send('$-1');
  }
};

module.exports = ResponseGenerator;
