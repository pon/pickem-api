'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('games', function (table) {
    table.increments('id');
    table.integer('week_id').notNullable();
    table.integer('home_team_id').notNullable();
    table.integer('away_team_id').notNullable();
    table.boolean('neutral_site').notNullable();
    table.string('site', 100).notNullable();
    table.dateTime('start_time').notNullable();
    table.decimal('spread').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('games');
};
