var Joi   = require('joi');
var team  = require('./team');

module.exports = {
  id: Joi.number().integer().required(),
  home_team: team,
  away_team: team,
  neutral_site: Joi.number().integer().required(),
  site: Joi.string().required(),
  start_time: Joi.date().required(),
  spread: Joi.number().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
  object: Joi.string().optional().default('game')
};
