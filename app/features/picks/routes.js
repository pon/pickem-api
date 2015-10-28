var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {

  server.route([{
    method: 'GET',
    path: '/picks',
    config: {
      handler: function (request, reply) {
        server.methods.picks.findAll(reply);
      }
    }
  }, {
    method: 'GET',
    path: '/picks/{id}',
    config: {
      handler: function (request, reply) {
        server.methods.picks.findById(request.params.id, reply);
      }
    }
  }, {
    method: 'POST',
    path: '/picks',
    config: {
      pre: [
        { method: 'games.findById(payload.game)', assign: 'game' },
        { method: 'users.findById(payload.user)', assign: 'user' },
        { method: 'teams.findById(payload.winning_team)', assign: 'winning_team' },
        { method: 'teams.findById(payload.losing_team)', assign: 'losing_team' }
      ],
      handler: function (request, reply) {
        request.payload.game = request.pre.game;
        request.payload.user = request.pre.user;
        request.payload.winning_team = request.pre.winning_team;
        request.payload.losing_team = request.pre.losing_team;

        server.methods.picks.create(request.payload, reply);
      },
      validate: {
        payload: {
          winning_team: Joi.number().integer().required(),
          losing_team: Joi.number().integer().required(),
          game: Joi.number().integer().required(),
          user: Joi.number().integer().required(),
          best_bet: Joi.number().integer().optional().default(0),
        }
      }
    }
  }, {
    method: 'POST',
    path: '/picks/{id}',
    config: {
      pre: [ { method: 'picks.findById(params.id)', assign: 'pick' } ],
      handler: function (request, reply) {
        var pick = request.pre.pick;

        request.payload.winning_team_id = request.payload.winning_team || pick.related('winning_team').id;
        request.payload.losing_team_id = request.payload.losing_team || pick.related('losing_team').id;

        server.methods.picks.update(pick, request.payload, reply);
      },
      validate: {
        payload: {
          winning_team: Joi.number().integer().optional(),
          losing_team: Joi.number().integer().optional(),
          best_bet: Joi.boolean().optional()
        }
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'picks.routes'
};
