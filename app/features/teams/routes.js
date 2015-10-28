var Boom        = require('boom');

exports.register = function (server, options, next) {

  server.route([{
    method: 'GET',
    path: '/teams',
    config: {
      handler: function (request, reply) {
        server.methods.teams.findAll(reply);
      }
    }
  }, {
    method: 'GET',
    path: '/teams/{id}',
    config: {
      handler: function (request, reply) {
        server.methods.teams.findById(request.params.id, reply);
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'teams.routes'
};
