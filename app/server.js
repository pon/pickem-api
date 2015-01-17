var Hapi    = require('hapi');
var server  = new Hapi.Server();
var config  = require('./config.json');

server.connection(config);

server.start(function () {
  console.log('Server running at: ', server.info.uri);
});
