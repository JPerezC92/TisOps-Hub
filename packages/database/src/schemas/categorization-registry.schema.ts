import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const categorizationRegistry = sqliteTable(
  'categorization_registry',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sourceValue: text('source_value').notNull().unique(),
    displayValue: text('display_value').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index('categorization_registry_source_value_idx').on(table.sourceValue),
    index('categorization_registry_display_value_idx').on(table.displayValue),
    index('categorization_registry_is_active_idx').on(table.isActive),
  ],
);

export type CategorizationRegistry = typeof categorizationRegistry.$inferSelect;
export type InsertCategorizationRegistry = typeof categorizationRegistry.$inferInsert;
