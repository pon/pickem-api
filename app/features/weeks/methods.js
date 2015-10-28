var Bluebird    = require('bluebird');

exports.register = function (server, options, next) {
  var Week = server.plugins.bookshelf.model('Week');

  server.method('weeks.findAll', function (next) {
    new Week().query(function (query) {
      query.orderBy('date_created', 'desc');
    })
    .fetchAll({ withRelated: ['games', 'games.home_team', 'games.away_team'] })
    .asCallback(next);
  });

  server.method('weeks.findById', function (id, next) {
    new Week({ id: id })
    .fetch({ require: true, withRelated: ['games', 'games.home_team', 'games.away_team'] })
    .catch(function (err) { throw Boom.notFound('week could not be found'); })
    .asCallback(next);
  });

  server.method('weeks.create', function (payload, next) {
    new Week()
    .save(payload)
    .then(function (week) {
      return week.load([
        'games',
        'games.home_team',
        'games.away_team'
      ]);
    })
    .asCallback(next);
  });

  server.method('weeks.update', function (week, payload, next) {
    week
    .save(payload, { patch: true })
    .then(function (week) {
      return week.load([
        'games',
        'games.home_team',
        'games.away_team'
      ]);
    })
    .asCallback(next);
  });

  next();
};

exports.register.attributes = {
  name: 'weeks.methods'
};
