'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('weeks', function (table) {
    table.increments('id');
    table.string('name', 100).notNullable();
    table.dateTime('open_date').notNullable();
    table.dateTime('close_date').notNullable();
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('weeks');
};
