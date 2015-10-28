var Bluebird  = require('bluebird');
var Bcrypt    = require('bcrypt');

exports.register = function (server, options, next) {
  var User = server.plugins.bookshelf.model('User');

  server.method('users.findById', function (id, next) {
    new User({ id: id })
    .fetch({ require: true })
    .catch(function () { throw Boom.notFound('user could not be found'); })
    .asCallback(next);
  });

  server.method('users.findAll', function (next) {
    new User().fetchAll().asCallback(next);
  });

  server.method('users.create', function (payload, next) {
    Bluebird.promisify(Bcrypt.hash)(payload.password, 10)
    .then(function (hash) {
      return new User().save({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        password: hash
      }).then(function (user) {
        return new User({ id: user.id }).fetch();
      });
    })
    .asCallback(next);
  });

  next();
};

exports.register.attributes = {
  name: 'users.methods'
};
