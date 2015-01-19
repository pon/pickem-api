var config  = require('./config.json');
var Hapi    = require('hapi');
var path    = require('path');
var server  = new Hapi.Server();

server.connection(config.server);

server.register([
  {
    register: require('hapi-bookshelf-models'),
    options: {
      knex: {
        client: 'sqlite3',
        connection: {
          filename: './pickem.sqlite3'
        }
      },
      plugins: ['registry'],
      models: path.join(__dirname, '/models'),
      base: function (bookshelf) {
        return bookshelf.Model.extend({
          hasTimestamps: true
        });
      }
    }
  }
], function (err) {
  if (err) { throw err; }
});

server.start(function () {
  console.log('Server running at: ', server.info.uri);
});
