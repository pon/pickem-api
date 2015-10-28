var Bluebird    = require('bluebird');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');

  server.method('games.findAll', function (next) {
    new Game().fetchAll({ withRelated: ['home_team', 'away_team'] })
    .asCallback(next);
  });

  server.method('games.findById', function (id, next) {
    new Game({ id: id })
    .fetch({ require: true, withRelated: ['home_team', 'away_team'] })
    .catch(function (err) { throw Boom.notFound('game could not be found'); })
    .asCallback(next);
  });

  server.method('games.create', function (payload, next) {
    new Game().save({
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
    })
    .asCallback(next);
  });

  server.method('games.update', function (game, payload, next) {
    Bluebird.all([
      server.methods.teams.findById(payload.home_team_id),
      server.methods.teams.findById(payload.away_team_id)
    ])
    .then(function () {
      return game.save(payload, { patch: true })
      .then(function (game) {
        return game.load(['home_team', 'away_team']);
      });
    })
    .asCallback(next);
  });

  next();
};

exports.register.attributes = {
  name: 'games.methods'
};
