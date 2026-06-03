import type { Knex } from 'knex'

export async function up (knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.boolean('is_diet')
  })
}

export async function down (knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropColumn('is_diet')
  })
}
