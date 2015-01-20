var Joi   = require('joi');
var game  = require('./game');

module.exports = {
  id: Joi.number().integer().required(),
  name: Joi.string().required(),
  open_date: Joi.date().required(),
  close_date: Joi.date().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
  games: Joi.array().includes(game),
  object: Joi.string().optional().default('week')
};
