import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  await knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
    table.uuid('new_id').defaultTo(knex.raw('uuid_generate_v4()'));
  });

  await knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
    table.dropPrimary();
    table.dropColumn('id');
    table.renameColumn('new_id', 'id');
    table.primary(['id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table: Knex.TableBuilder) => {
    table.dropPrimary();
    table.dropColumn('id');
    table.increments('id').primary();
  });

  await knex.schema.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
