import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const applicationRegistry = sqliteTable(
  'application_registry',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
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
    index('application_registry_code_idx').on(table.code),
    index('application_registry_is_active_idx').on(table.isActive),
  ],
);

export type ApplicationRegistry = typeof applicationRegistry.$inferSelect;
export type InsertApplicationRegistry = typeof applicationRegistry.$inferInsert;
