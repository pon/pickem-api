var bcrypt  = require('bcrypt');
var Boom    = require('boom');
var Joi     = require('joi');
var jwt     = require('jsonwebtoken');

exports.register = function (server, options, next) {
  var User = server.plugins.bookshelf.model('User');

  var validate = function (request, decodedToken, next) {
    new User({ id: decodedToken.user }).fetch({
      require: true
    })
    .then(function (user) {
      next(null, true, user.toJSON());
    })
    .catch(function () {
      next(null, false);
    });
  };

  // Register Auth Plugin
  server.register(require('hapi-auth-jwt'), function (err) {
    /* istanbul ignore next */
    if (err) {
      return next(err);
    }

    server.auth.strategy('token', 'jwt', true, {
      key: 'pickemapi',
      validateFunc: validate
    });
  });

  server.route({
    method: 'POST',
    path: '/tokens',
    config: {
      auth: false,
      handler: function (request, reply) {
        reply(new User({ email: request.payload.email })
        .fetch({
          require: true
        })
        .then(function (user) {
          if (bcrypt.compareSync(request.payload.password,
            user.get('password'))) {
            return {
              token: jwt.sign({ user: user.get('id') },
              'pickemapi')
            };
          } else {
            return Boom.badRequest('incorrect password');
          }
        })
        .catch(function () {
          return Boom.notFound('user could not be found');
        }));
      },
      validate: {
        payload: {
          email: Joi.string().email().required(),
          password: Joi.string().required()
        }
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'authentication',
  version: '1.0.0'
};

