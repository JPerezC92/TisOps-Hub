import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const moduleRegistry = sqliteTable(
  'module_registry',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sourceValue: text('source_value').notNull().unique(),
    displayValue: text('display_value').notNull(),
    application: text('application').notNull(), // CD, FFVV, SB, or UNETE
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
    index('module_registry_source_value_idx').on(table.sourceValue),
    index('module_registry_display_value_idx').on(table.displayValue),
    index('module_registry_application_idx').on(table.application),
    index('module_registry_is_active_idx').on(table.isActive),
  ],
);

export type ModuleRegistry = typeof moduleRegistry.$inferSelect;
export type InsertModuleRegistry = typeof moduleRegistry.$inferInsert;
