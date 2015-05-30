var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');

  server.method('games.findAll', function (next) {
    var promise = new Game().fetchAll({ withRelated: ['home_team', 'away_team'] });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('games.findById', function (id, next) {
    var promise = new Game({ id: id })
    .fetch({ require: true, withRelated: ['home_team', 'away_team'] })
    .catch(function (err) { throw Boom.notFound('game could not be found'); });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('games.create', function (payload, next) {
    var promise = new Game().save({
      neutral_site: payload.neutral_site,
      site: payload.site,
      start_time: payload.start_time,
      spread: payload.spread,
      home_team_id: payload.home_team.id,
      away_team_id: payload.away_team.id,
      week_id: payload.week.id
    })
    .then(function (game) {
      return game.load([ 'home_team', 'away_team' ]);
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('games.update', function (game, payload, next) {
    var promise = Bluebird.all([
      server.methods.teams.findById(payload.home_team_id),
      server.methods.teams.findById(payload.away_team_id)
    ])
    .then(function () {
      return game.save(payload, { patch: true })
      .then(function (game) {
        return game.load(['home_team', 'away_team']);
      });
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.route([{
    method: 'GET',
    path: '/games',
    config: {
      handler: function (request, reply) {
        reply(server.methods.games.findAll());
      }
    }
  }, {
    method: 'GET',
    path: '/games/{id}',
    config: {
      handler: function (request, reply) {
        reply(server.methods.games.findById(request.params.id));
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

        reply(server.methods.games.create(request.payload));
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

        reply(server.methods.games.update(game, request.payload));
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
  name: 'games',
  version: '1.0.0'
};
