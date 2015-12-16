'use strict';

var net = require('net'),
  config = require('./config'),
  ResponseGenerator = require('./response'),
  cmd = require('./cmd'),
  redis = require('./redis');

var operations = {
  'GET': redis.get,
  'SET': redis.set,
  'DEL': redis.del,
  'EXISTS': redis.exists,
  'INCR': redis.incr,
  'DECR': redis.decr
};

var server = net.createServer(function(socket) {
  socket.setEncoding('utf8');

  var req, res = new ResponseGenerator(socket);

  socket.on('data', function(packet) {
    try{
      req = cmd.CommandParser.parse(packet);
    } catch(e) {
      if (e instanceof cmd.CommandParseError) {
        res.error(e.message);
      } else {
        console.error(e.stack);
        res.error('Internal Server Error');
      }
      return;
    }

    if (req.cmd === 'QUIT') {
      socket.destroy();
    }

    var operation = operations[req.cmd];
    if (operation === undefined) {
      res.error('Unsupported operation requested');
    } else {
      operation(req, res);
    }
  });

  socket.on('eof', function() {
    socket.destroy();
  });
});

var port = process.argv[2] || config.PORT;
server.listen(port, 'localhost');