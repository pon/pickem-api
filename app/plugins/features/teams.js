var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Team = server.plugins.bookshelf.model('Team');
  server.route([{
    method: 'GET',
    path: '/teams',
    config: {
      handler: function (request, reply) {
        return reply(new Team().query(function (query) {
          query
            .orderBy('name', 'asc');
        }).fetchAll()
        .then(function (teams) {
          return teams.toJSON();
        }));
      }
    }
  }, {
    method: 'GET',
    path: '/teams/{id}',
    config: {
      handler: function (request, reply) {
        return reply(new Team({ id: request.params.id })
        .fetch({ require: true })
        .then(function (team) {
          return team.toJSON();
        })
        .catch(function (err) {
          return Boom.notFound('team could not be found');
        }));
      }
    }
  }]);
};

exports.register.attributes = {
  name: 'teams',
  version: '1.0.0'
};
