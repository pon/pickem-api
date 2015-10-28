
exports.register = function (server, options, next) {
  var Team = server.plugins.bookshelf.model('Team');

  server.method('teams.findAll', function (next) {
    new Team().query(function (query) {
      query.orderBy('name', 'asc');
    })
    .fetchAll()
    .asCallback(next);
  });

  server.method('teams.findById', function (id, next) {
    new Team({ id: id })
    .fetch({ require: true })
    .catch(function (err) { throw Boom.notFound('team could not be found'); })
    .asCallback(next);
   });

  next();
};

exports.register.attributes = {
  name: 'teams.methods'
};
