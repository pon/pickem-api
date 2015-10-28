var Boom      = require('boom');
var Joi       = require('joi');

exports.register = function (server, options, next) {

  server.route([{
    method: 'GET',
    path: '/users/{id}',
    config: {
      handler: function (request, reply) {
        server.methods.users.findById(request.params.id, reply);
      }
    }
  },
  {
    method: 'GET',
    path: '/users',
    config: {
      handler: function (request, reply) {
        server.methods.users.findAll(reply);
      }
    }
  }, {
    method: 'POST',
    path: '/users',
    config: {
      auth: false,
      handler: function (request, reply) {
        server.methods.users.create(request.payload, reply);
      },
      validate: {
        payload: {
          first_name: Joi.string().max(110).required(),
          last_name: Joi.string().max(110).required(),
          email: Joi.string().max(100).required(),
          password: Joi.string().required()
        }
      }
    }
  }, {
    method: 'GET',
    path: '/users/current',
    config: {
      handler: function (request, reply) {
        server.methods.users.findById(request.auth.credentials.id, reply);
      }
    }
  }]);

  next();
};

exports.register.attributes = {
  name: 'users.routes'
};
