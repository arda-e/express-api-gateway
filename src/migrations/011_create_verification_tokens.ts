import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.withSchema("authentication").createTable("verification_tokens", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("authentication.users")
      .onDelete("CASCADE");
    table.string("token").notNullable().unique();
    table.string("type").notNullable();
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);
  });
  const arda = await knex.raw(knex.hintComment);
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.withSchema("authentication").dropTableIfExists("verification_tokens");
}
