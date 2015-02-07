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
        .catch(function (err) {
          return Boom.notFound('week could not be found');
        }));
      }
    }
  }, {
    method: 'POST',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        return reply(
          new Week().save(request.payload)
          .then(function (week) {
            return week.load([
              'games',
              'games.home_team',
              'games.away_team'
            ]);
          })
        );
      },
      validate: {
        payload: {
          name: Joi.string().required(),
          open_date: Joi.date().required(),
          close_date: Joi.date().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: '/weeks/{id}',
    config: {
      handler: function (request, reply) {
        return reply(
          new Week({ id: request.params.id })
          .save(request.payload, { patch: true })
          .then(function (week) {
            return new Week({ id: request.params.id })
            .fetch({
              require: true,
              withRelated: ['games', 'games.home_team', 'games.away_team']
            });
          })
        );
      },
      validate: {
        payload: {
          name: Joi.string().optional(),
          open_date: Joi.date().optional(),
          close_date: Joi.date().optional()
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'weeks',
  version: '1.0.0'
};
