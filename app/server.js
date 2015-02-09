var config  = require('./config.json');
var Hapi    = require('hapi');
var path    = require('path');

var server = new Hapi.Server({
  connections: {
    router: {
      stripTrailingSlash: true
    },
    routes: {
      cors: {
        origin: ['*'],
        credentials: false
      }
    }
  }
});

server.connection(config);

server.register([
  {
    register: require('hapi-bookshelf-serializer'),
    options: {
      directory: path.join(__dirname, '/serializers')
    }
  },
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
  { register: require('./plugins/services/authentication') },
  { register: require('./plugins/features/teams') },
  { register: require('./plugins/features/weeks') },
  { register: require('./plugins/features/games') },
  { register: require('./plugins/features/picks') },
  { register: require('./plugins/features/users') }
], function (err) {
  if (err) { throw err; }
});

server.start(function () {
  console.log('Server running at: ', server.info.uri);
});
