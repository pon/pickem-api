var Joi   = require('joi');

module.exports = {
  id: Joi.number().integer().required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
  object: Joi.string().optional().default('user')
};
