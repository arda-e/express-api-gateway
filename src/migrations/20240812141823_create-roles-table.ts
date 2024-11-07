import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('roles', (table: Knex.TableBuilder) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name').unique().notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('roles').alterTable('roles', (table: Knex.TableBuilder) => {
    table.dropPrimary();
  });
}
