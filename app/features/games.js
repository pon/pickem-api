var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');
  var Team = server.plugins.bookshelf.model('Team');
  var Week = server.plugins.bookshelf.model('Week');

  server.route([{
    method: 'GET',
    path: '/games',
    config: {
      handler: function (request, reply) {
        return reply(new Game().fetchAll({
          withRelated: ['home_team', 'away_team']
        }));
      }
    }
  }, {
    method: 'GET',
    path: '/games/{id}',
    config: {
      handler: function (request, reply) {
        return reply(new Game({ id: request.params.id })
        .fetch({
          require: true,
          withRelated: ['home_team', 'away_team']
        })
        .catch(function (err) {
          return Boom.notFound('game could not be found');
        }));
      }
    }
  }, {
    method: 'POST',
    path: '/games',
    config: {
      handler: function (request, reply) {
        return reply(
          Bluebird.all([
            new Team({ id: request.payload.home_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('home_team could not be found');
            }),
            new Team({ id: request.payload.away_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('away_team could not be found');
            }),
            new Week({ id: request.payload.week })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('week could not be found');
            })
          ])
          .spread(function (homeTeam, awayTeam, week) {
            return new Game().save({
              neutral_site: request.payload.neutral_site,
              site: request.payload.site,
              start_time: request.payload.start_time,
              spread: request.payload.spread,
              home_team_id: homeTeam.id,
              away_team_id: awayTeam.id,
              week_id: week.id
            })
            .then(function (game) {
              return game.load([
                'home_team',
                'away_team'
              ]);
            });
          })
        );
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
      handler: function (request, reply) {
        return reply(
          Bluebird.all([
            new Game({ id: request.params.id })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('game could not be found');
            }),
            request.payload.home_team && new Team({ id: request.payload.home_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('home_team could not be found');
            }),
            request.payload.away_team && new Team({ id: request.payload.away_team })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('away_team could not be found');
            }),
            request.payload.week && new Week({ id: request.payload.week })
            .fetch({ require: true })
            .catch(function () {
              throw Boom.notFound('week could not be found');
            })
          ])
          .spread(function (game, homeTeam, awayTeam, week) {
            delete request.payload.home_team;
            delete request.payload.away_team;
            delete request.payload.week;

            var updateObject = request.payload;
            if (homeTeam) { updateObject.home_team_id = homeTeam.id; }
            if (awayTeam) { updateObject.away_team_id = awayTeam.id; }
            if (week) { updateObject.week_id = week.id; }

            return game.save(updateObject, { patch: true })
            .then(function (game) {
              return new Game({ id: request.params.id })
              .fetch({ withRelated: ['home_team', 'away_team'] });
            });
          })
        );
      },
      validate: {
        payload: {
          neutral_site: Joi.number().integer().optional(),
          site: Joi.string().optional(),
          start_time: Joi.date().optional(),
          spread: Joi.number().optional(),
          home_team: Joi.number().integer().optional(),
          away_team: Joi.number().integer().optional(),
          week: Joi.number().integer().optional()
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
