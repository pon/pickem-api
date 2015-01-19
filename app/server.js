var config  = require('./config.json');
var Hapi    = require('hapi');
var path    = require('path');
var server  = new Hapi.Server();

server.connection(config);

server.register([
  {
    register: require('hapi-bookshelf-models'),
    options: {
      knex: require('../db/knexfile').development,
      plugins: ['registry'],
      models: path.join(__dirname, '/models'),
      base: function (bookshelf) {
        return bookshelf.Model.extend({
          hasTimestamps: true
        });
      }
    }
  },
  { register: require('./plugins/features/teams') }
], function (err) {
  if (err) { throw err; }
});

server.start(function () {
  console.log('Server running at: ', server.info.uri);
});
