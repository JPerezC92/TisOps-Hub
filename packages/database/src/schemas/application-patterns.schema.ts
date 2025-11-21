import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { applicationRegistry } from './application-registry.schema';

export const applicationPatterns = sqliteTable(
  'application_patterns',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    applicationId: integer('application_id')
      .notNull()
      .references(() => applicationRegistry.id, { onDelete: 'cascade' }),
    pattern: text('pattern').notNull(),
    priority: integer('priority').notNull().default(100),
    matchType: text('match_type').notNull().default('contains'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  },
  (table) => [
    index('application_patterns_application_id_idx').on(table.applicationId),
    index('application_patterns_priority_idx').on(table.priority),
    index('application_patterns_is_active_idx').on(table.isActive),
  ],
);

export type ApplicationPattern = typeof applicationPatterns.$inferSelect;
export type InsertApplicationPattern = typeof applicationPatterns.$inferInsert;
