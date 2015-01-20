var Joi = require('joi');

module.exports = {
  id: Joi.number().integer().required(),
  name: Joi.string().required(),
  object: Joi.string().optional().default('team')
};
