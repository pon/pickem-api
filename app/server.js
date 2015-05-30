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
  require('./services/serialize'),
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
  { register: require('./features/users') },
  { register: require('./services/authentication') },
  { register: require('./features/teams') },
  { register: require('./features/weeks') },
  { register: require('./features/games') },
  { register: require('./features/picks') }
], function (err) {
  if (err) { throw err; }
});

server.start(function () {
  console.log('Server running at: ', server.info.uri);
});
