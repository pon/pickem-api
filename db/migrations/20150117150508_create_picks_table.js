'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('picks', function (table) {
    table.increments('id');
    table.integer('game_id').notNullable();
    table.integer('user_id').notNullable();
    table.integer('winning_team_id').notNullable();
    table.integer('losing_team_id').notNullable();
    table.boolean('best_bet').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('picks');
};
