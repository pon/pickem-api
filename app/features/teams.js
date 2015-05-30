var Boom        = require('boom');

exports.register = function (server, options, next) {

  var Team = server.plugins.bookshelf.model('Team');

  server.method('teams.findAll', function (next) {
    var promise = new Team().query(function (query) {
      query.orderBy('name', 'asc');
    })
    .fetchAll();

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('teams.findById', function (id, next) {
    var promise = new Team({ id: id })
    .fetch({ require: true })
    .catch(function (err) { throw Boom.notFound('team could not be found'); });
    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.route([{
    method: 'GET',
    path: '/teams',
    config: {
      handler: function (request, reply) {
        reply(server.methods.teams.findAll());
      }
    }
  }, {
    method: 'GET',
    path: '/teams/{id}',
    config: {
      handler: function (request, reply) {
        reply(server.methods.teams.findById(request.params.id));
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'teams'
};
