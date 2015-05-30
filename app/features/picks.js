var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');
  var Pick = server.plugins.bookshelf.model('Pick');
  var Team = server.plugins.bookshelf.model('Team');
  var User = server.plugins.bookshelf.model('User');

  server.method('picks.findAll', function (next) {
    var promise = new Pick()
    .fetchAll({ withRelated: ['game', 'winning_team', 'losing_team'] });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('picks.findById', function (id, next) {
    var promise = new Pick({ id: id })
    .fetch({
      require: true,
      withRelated: ['game', 'winning_team', 'losing_team']
    })
    .catch(function (err) {
      throw Boom.notFound('pick could not be found');
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('picks.create', function (payload, next) {
    var promise = new Pick().save({
      game_id: payload.game.id,
      user_id: payload.user.id,
      winning_team_id: payload.winning_team.id,
      losing_team_id: payload.losing_team.id,
      best_bet: payload.best_bet
    })
    .then(function (pick) {
      return pick.load([
        'game',
        'winning_team',
        'losing_team'
      ]);
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('picks.update', function (pick, payload, next) {
    var promise = Bluebird.all([
      server.methods.teams.findById(payload.winning_team_id),
      server.methods.teams.findById(payload.losing_team_id)
    ])
    .then(function () {
      return pick.save(payload, { patch: true })
      .then(function (pick) {
        return pick.load(['game', 'winning_team', 'losing_team']);
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
    path: '/picks',
    config: {
      handler: function (request, reply) {
        reply(server.methods.picks.findAll());
      }
    }
  }, {
    method: 'GET',
    path: '/picks/{id}',
    config: {
      handler: function (request, reply) {
        reply(server.methods.picks.findById(request.params.id));
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

        reply(server.methods.picks.create(request.payload));
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

        reply(server.methods.picks.update(pick, request.payload));
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
  name: 'picks',
  version: '1.0.0'
};
