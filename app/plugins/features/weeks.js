var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Week = server.plugins.bookshelf.model('Week');
  server.route([{
    method: 'GET',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        return reply(new Week().query(function (query) {
          query
            .orderBy('date_created', 'desc');
        }).fetchAll({
          withRelated: ['games', 'games.home_team', 'games.away_team']
        })
        .then(function (weeks) {
          return weeks;
        }));
      }
    }
  }, {
    method: 'GET',
    path: '/weeks/{id}',
    config: {
      handler: function (request, reply) {
        return reply(new Week({ id: request.params.id })
        .fetch({
          require: true,
          withRelated: ['games', 'games.home_team', 'games.away_team']
        })
        .then(function (week) {
          return week;
        })
        .catch(function (err) {
          return Boom.notFound('week could not be found');
        }));
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'weeks',
  version: '1.0.0'
};
