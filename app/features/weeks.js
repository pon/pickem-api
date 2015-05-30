var Bluebird    = require('bluebird');
var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {
  var Week = server.plugins.bookshelf.model('Week');

  server.method('weeks.findAll', function (next) {
    var promise = new Week().query(function (query) {
      query.orderBy('date_created', 'desc');
    })
    .fetchAll({ withRelated: ['games', 'games.home_team', 'games.away_team'] });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('weeks.findById', function (id, next) {
    var promise = new Week({ id: id })
    .fetch({ require: true, withRelated: ['games', 'games.home_team', 'games.away_team'] })
    .catch(function (err) { throw Boom.notFound('week could not be found'); });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('weeks.create', function (payload, next) {
    var promise = new Week()
    .save(payload)
    .then(function (week) {
      return week.load([
        'games',
        'games.home_team',
        'games.away_team'
      ]);
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('weeks.update', function (week, payload, next) {
    var promise = week
    .save(payload, { patch: true })
    .then(function (week) {
      return week.load([
        'games',
        'games.home_team',
        'games.away_team'
      ]);
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.route([{
    method: 'GET',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        reply(server.methods.weeks.findAll());
      }
    }
  }, {
    method: 'GET',
    path: '/weeks/{id}',
    config: {
      handler: function (request, reply) {
        reply(server.methods.weeks.findById(request.params.id));
      }
    }
  }, {
    method: 'POST',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        reply(server.methods.weeks.create(request.payload));
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
      pre: [ { method: 'weeks.findById(params.id)', assign: 'week' } ],
      handler: function (request, reply) {
        reply(server.methods.weeks.update(request.pre.week, request.payload));
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
