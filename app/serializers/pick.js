var Joi   = require('joi');
var game  = require('./game');
var team  = require('./team');

module.exports = {
  id: Joi.number().integer().required(),
  game: game,
  winning_team: team,
  losing_team: team,
  best_bet: Joi.number().integer().required(),
  created_at: Joi.date().required(),
  updated_at: Joi.date().required(),
  object: Joi.string().optional().default('pick')
};
