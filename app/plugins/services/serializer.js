var Boom        = require('boom');
var fs          = require('fs');
var Joi         = require('joi');
var path        = require('path');

module.exports.register = function (server, options, next) {

  var internals = {};

  internals.format = function (model) {
    if (model.serializer) {
      var formattedModel = Joi.validate(model.toJSON(),
        serializers[model.serializer], { stripUnknown: true });

      if (formattedModel.error) {
        throw formattedModel.error;
      } else {
        return formattedModel.value;
      }
    }
  };

  var serializerFiles = fs.readdirSync(options.directory);
  var serializers = {};

  serializerFiles.forEach(function (file) {
    var serializerName = path.basename(file).replace(path.extname(file), '');
    serializers[serializerName] = require(path.join(options.directory,
      file));
  });

  server.ext('onPreResponse', function (request, reply) {
    if (request.response.source && request.response.source.models) {
      try {
        var models = request.response.source.models.map(internals.format);

        reply(models);
      } catch (ex) {
        reply(Boom.badImplementation(ex.toString()));
      }
    } else if (request.response.source && request.response.source.serializer) {
      try {
        var model = internals.format(request.response.source);
        reply(model);
      } catch (ex) {
        reply(Boom.badImplementation(ex.toString()));
      }
    } else {
      reply(request.response);
    }
  });
  next();
};

module.exports.register.attributes = {
  name: 'serializer',
  version: '1.0.0'
};
