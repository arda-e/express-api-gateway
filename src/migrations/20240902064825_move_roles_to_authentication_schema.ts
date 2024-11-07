import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the authentication schema if it doesn't exist
  await knex.raw('CREATE SCHEMA IF NOT EXISTS authentication');

  const rolesExistsInPublic = await knex.schema.hasTable('roles');
  const rolesExistsInAuth = await knex.schema.withSchema('authentication').hasTable('roles');

  if (rolesExistsInPublic) {
    // If roles exists in public, move it to authentication
    await knex.raw('ALTER TABLE public.roles SET SCHEMA authentication');
  } else if (!rolesExistsInAuth) {
    // If roles doesn't exist in authentication, create it
    await knex.schema.withSchema('authentication').createTable('roles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name').notNullable().unique();
      table.string('description');
      table.timestamps(true, true);
    });
  }
  // If roles already exists in authentication, do nothing
}

export async function down(knex: Knex): Promise<void> {
  // This down migration is potentially destructive, use with caution
  await knex.schema.withSchema('authentication').dropTableIfExists('roles');
}
