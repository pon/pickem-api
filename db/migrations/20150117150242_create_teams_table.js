exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', function (table) {
    table.integer('id').primary();
    table.string('name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
