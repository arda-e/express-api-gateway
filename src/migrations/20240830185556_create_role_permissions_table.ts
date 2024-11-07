import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.withSchema('authentication').createTable('role_permissions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table
      .uuid('roleId')
      .notNullable()
      .references('id')
      .inTable('authentication.roles')
      .onDelete('CASCADE');
    table
      .uuid('permissionId')
      .notNullable()
      .references('id')
      .inTable('authentication.permissions')
      .onDelete('CASCADE');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema('authentication').dropTable('role_permissions');
}
