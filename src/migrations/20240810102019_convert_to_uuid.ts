exports.up = function (knex) {
  return knex.schema
    .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    .alterTable('users', function (table) {
      table.uuid('new_id').defaultTo(knex.raw('uuid_generate_v4()'));
    })
    .then(() => {
      return knex.schema.alterTable('users', function (table) {
        table.dropPrimary();
        table.dropColumn('id');
        table.renameColumn('new_id', 'id');
        table.primary('id');
      });
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('users', function (table) {
      table.dropPrimary();
      table.dropColumn('id');
      table.increments('id').primary();
    })
    .raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
};
