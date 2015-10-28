var Bluebird    = require('bluebird');

exports.register = function (server, options, next) {
  var Game = server.plugins.bookshelf.model('Game');
  var Pick = server.plugins.bookshelf.model('Pick');
  var Team = server.plugins.bookshelf.model('Team');
  var User = server.plugins.bookshelf.model('User');

  server.method('picks.findAll', function (next) {
    new Pick().fetchAll({ withRelated: ['game', 'winning_team', 'losing_team'] })
    .asCallback(next);
  });

  server.method('picks.findById', function (id, next) {
    new Pick({ id: id })
    .fetch({
      require: true,
      withRelated: ['game', 'winning_team', 'losing_team']
    })
    .catch(function (err) {
      throw Boom.notFound('pick could not be found');
    })
    .asCallback(next);
  });

  server.method('picks.create', function (payload, next) {
    new Pick().save({
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
    })
    .asCallback(next);
  });

  server.method('picks.update', function (pick, payload, next) {
    Bluebird.all([
      server.methods.teams.findById(payload.winning_team_id),
      server.methods.teams.findById(payload.losing_team_id)
    ])
    .then(function () {
      return pick.save(payload, { patch: true })
      .then(function (pick) {
        return pick.load(['game', 'winning_team', 'losing_team']);
      });
    })
    .asCallback(next);
  });

  next();
};

exports.register.attributes = {
  name: 'picks.methods'
};
