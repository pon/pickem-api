var Boom        = require('boom');

exports.register = function (server, options, next) {

  var Team = server.plugins.bookshelf.model('Team');

  server.method('teams.findAll', function () {
    return new Team().query(function (query) {
      query.orderBy('name', 'asc');
    })
    .fetchAll();
  });

  server.method('teams.findById', function (id) {
    return new Team({ id: id })
    .fetch({ require: true })
    .catch(function (err) { return Boom.notFound('team could not be found'); });
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
