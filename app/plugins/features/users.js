var Bluebird  = require('bluebird');
var Bcrypt    = require('bcrypt');
var Boom      = require('boom');
var Joi       = require('joi');

/* jshint camelcase: false */
exports.register = function (server, options, next) {
  var User = server.plugins.bookshelf.model('User');

  server.route([{
    method: 'GET',
    path: '/users/{id}',
    config: {
      handler: function (request, reply) {
        reply(new User({ id: request.params.id })
        .fetch({ require: true })
        .catch(function () {
          return Boom.notFound('user could not be found');
        }));
      }
    }
  },
  {
    method: 'GET',
    path: '/users',
    config: {
      handler: function (request, reply) {
        reply(new User().fetchAll());
      }
    }
  }, {
    method: 'POST',
    path: '/users',
    config: {
      handler: function (request, reply) {
        reply(Bluebird.promisify(Bcrypt.hash)(request.payload.password, 10)
        .then(function (hash) {
          return new User().save({
            first_name: request.payload.first_name,
            last_name: request.payload.last_name,
            email: request.payload.email,
            password: hash
          }).then(function (user) {
            return new User({ id: user.id }).fetch();
          });
        }));
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
        reply(new User({ id: request.auth.credentials.id })
        .fetch({
          require: true
        }));
      }
    }
  }]);
  next();
};

exports.register.attributes = {
  name: 'users',
  version: '1.0.0'
};
/* jshint camelcase: true */
