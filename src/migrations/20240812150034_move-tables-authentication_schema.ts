import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE users SET SCHEMA authentication');
  await knex.raw('ALTER TABLE roles SET SCHEMA authentication');
  await knex.raw('ALTER TABLE user_roles SET SCHEMA authentication');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('ALTER TABLE authentication.users SET SCHEMA public');
  await knex.raw('ALTER TABLE authentication.roles SET SCHEMA public');
  await knex.raw('ALTER TABLE authentication.user_roles SET SCHEMA public');
}
