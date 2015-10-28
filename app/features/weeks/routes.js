var Boom        = require('boom');
var Joi         = require('joi');

exports.register = function (server, options, next) {

  server.route([{
    method: 'GET',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        server.methods.weeks.findAll(reply);
      }
    }
  }, {
    method: 'GET',
    path: '/weeks/{id}',
    config: {
      handler: function (request, reply) {
        server.methods.weeks.findById(request.params.id, reply);
      }
    }
  }, {
    method: 'POST',
    path: '/weeks',
    config: {
      handler: function (request, reply) {
        server.methods.weeks.create(request.payload, reply);
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
        server.methods.weeks.update(request.pre.week, request.payload, reply);
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
  name: 'weeks.routes'
};
