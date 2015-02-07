var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');
  var Pick = server.plugins.bookshelf.model('Pick');
  var Team = server.plugins.bookshelf.model('Team');
  var User = server.plugins.bookshelf.model('User');

  server.route([{
    method: 'GET',
    path: '/picks',
    config: {
      handler: function (request, reply) {
        return reply(new Pick().fetchAll({
          withRelated: ['game', 'winning_team', 'losing_team']
        }));
      }
    }
  }, {
    method: 'GET',
    path: '/picks/{id}',
    config: {
      handler: function (request, reply) {
        return reply(new Pick({ id: request.params.id })
        .fetch({
          require: true,
          withRelated: ['game', 'winning_team', 'losing_team']
        })
        .catch(function (err) {
          return Boom.notFound('pick could not be found');
        }));
      }
    }
  }, {
    method: 'POST',
    path: '/picks',
    config: {
      handler: function (request, reply) {
        return reply(
          Bluebird.all([
            new Game({ id: request.payload.game })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('game could not be found');
            }),
            new User({ id: request.payload.user })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('user could not be found');
            }),
            new Team({ id: request.payload.winning_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('winning_team could not be found');
            }),
            new Team({ id: request.payload.losing_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('losing_team could not be found');
            })
          ])
          .spread(function (game, user, winningTeam, losingTeam) {
            return new Pick().save({
              game_id: game.id,
              user_id: user.id,
              winning_team_id: winningTeam.id,
              losing_team_id: losingTeam.id,
              best_bet: request.payload.best_bet
            })
            .then(function (pick) {
              return pick.load([
                'game',
                'winning_team',
                'losing_team'
              ]);
            });
          })
        );
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
      handler: function (request, reply) {
        return reply(
          Bluebird.all([
            new Pick({ id: request.params.id })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('pick could not be found');
            }),
            request.payload.game && new Game({ id: request.payload.game })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('game could not be found');
            }),
            request.payload.user && new User({ id: request.payload.user })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('user could not be found');
            }),
            request.payload.winning_team && new Team({ id: request.payload.winning_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('winning_team could not be found');
            }),
            request.payload.losing_team && new Team({ id: request.payload.losing_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('losing_team could not be found');
            })
          ])
          .spread(function (pick, game, user, winningTeam, losingTeam) {
            delete request.payload.game;
            delete request.payload.user;
            delete request.payload.winning_team;
            delete request.payload.losing_team;

            var updateObject = request.payload;
            if (game) { updateObject.game_id = game.id; }
            if (user) { updateObject.user_id = user.id; }
            if (winningTeam) { updateObject.winning_team_id = winningTeam.id; }
            if (losingTeam) { updateObject.losing_team_id = losingTeam.id; }

            return pick.save(updateObject, { patch: true })
            .then(function (game) {
              return new Pick({ id: request.params.id })
              .fetch({ withRelated: ['game', 'winning_team', 'losing_team'] });
            });
          })
        );
      },
      validate: {
        payload: {
          winning_team: Joi.number().integer().optional(),
          losing_team: Joi.number().integer().optional(),
          game: Joi.number().integer().optional(),
          user: Joi.number().integer().optional(),
          best_bet: Joi.number().integer().optional()
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
