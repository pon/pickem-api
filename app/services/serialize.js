'use strict';

exports.register = function (server, options, next) {

  server.ext('onPreResponse', function (request, reply) {
    if (request.response.source && request.response.source.models) {
      var models = request.response.source.models.map(function (model) {
        return model.serialize(request);
      });

      request.response.source = models;
    } else if (request.response.source) {
      if (request.response.source.serialize instanceof Function) {
        request.response.source = request.response.source.serialize(request);
      }
    }

    reply.continue();
  });

  next();
};

exports.register.attributes = {
  name: 'serialize'
};
