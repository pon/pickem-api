exports.register = function (server, options, next) {

  server.register([
    require('./methods'),
    require('./routes')
  ], function (err) {
    if (err) { throw err; }
  });

  next();
};

exports.register.attributes = {
  name: 'users'
};
