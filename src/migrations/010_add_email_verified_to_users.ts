import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.withSchema("authentication").alterTable("users", (table) => {
    table.boolean("emailVerified").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.withSchema("authentication").alterTable("users", (table) => {
    table.dropColumn("emailVerified");
  });
}
