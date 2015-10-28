var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {

  server.route([{
    method: 'GET',
    path: '/games',
    config: {
      handler: function (request, reply) {
        server.methods.games.findAll(reply);
      }
    }
  }, {
    method: 'GET',
    path: '/games/{id}',
    config: {
      handler: function (request, reply) {
        server.methods.games.findById(request.params.id, reply);
      }
    }
  }, {
    method: 'POST',
    path: '/games',
    config: {
      pre: [
        { method: 'teams.findById(payload.home_team)', assign: 'home_team' },
        { method: 'teams.findById(payload.away_team)', assign: 'away_team' },
        { method: 'weeks.findById(payload.week)', assign: 'week' }
      ],
      handler: function (request, reply) {
        request.payload.home_team = request.pre.home_team;
        request.payload.away_team = request.pre.away_team;
        request.payload.week = request.pre.week;

        server.methods.games.create(request.payload, reply);
      },
      validate: {
        payload: {
          neutral_site: Joi.number().integer().optional().default(0),
          site: Joi.string().required(),
          start_time: Joi.date().required(),
          spread: Joi.number().optional().default(0),
          home_team: Joi.number().integer().required(),
          away_team: Joi.number().integer().required(),
          week: Joi.number().integer().required()
        }
      }
    }
  }, {
    method: 'POST',
    path: '/games/{id}',
    config: {
      pre: [ { method: 'games.findById(params.id)', assign: 'game' } ],
      handler: function (request, reply) {
        var game = request.pre.game;
        request.payload.home_team_id = request.payload.home_team || game.related('home_team').id;
        request.payload.away_team_id = request.payload.away_team || game.related('away_team').id;

        server.methods.games.update(game, request.payload, reply);
      },
      validate: {
        payload: {
          neutral_site: Joi.number().integer().optional(),
          site: Joi.string().optional(),
          start_time: Joi.date().optional(),
          spread: Joi.number().optional(),
          home_team: Joi.number().integer().optional(),
          away_team: Joi.number().integer().optional()
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'games.routes'
};
