var Bluebird  = require('bluebird');
var Bcrypt    = require('bcrypt');
var Boom      = require('boom');
var Joi       = require('joi');

exports.register = function (server, options, next) {
  var User = server.plugins.bookshelf.model('User');

  server.method('users.findById', function (id, next) {
    var promise = new User({ id: id })
    .fetch({ require: true })
    .catch(function () { throw Boom.notFound('user could not be found'); });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('users.findAll', function (next) {
    var promise = new User().fetchAll();

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.method('users.create', function (payload, next) {
    var promise = Bluebird.promisify(Bcrypt.hash)(payload.password, 10)
    .then(function (hash) {
      return new User().save({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        password: hash
      }).then(function (user) {
        return new User({ id: user.id }).fetch();
      });
    });

    if (next) {
      next(promise);
    } else {
      return promise;
    }
  });

  server.route([{
    method: 'GET',
    path: '/users/{id}',
    config: {
      handler: function (request, reply) {
        reply(server.methods.users.findById(request.params.id));
      }
    }
  },
  {
    method: 'GET',
    path: '/users',
    config: {
      handler: function (request, reply) {
        reply(server.methods.users.findAll());
      }
    }
  }, {
    method: 'POST',
    path: '/users',
    config: {
      handler: function (request, reply) {
        reply(server.methods.users.create(request.payload));
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
        reply(server.methods.users.findById(request.auth.credentials.id));
      }
    }
  }]);
  next();
};

exports.register.attributes = {
  name: 'users',
  version: '1.0.0'
};
