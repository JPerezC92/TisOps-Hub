import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const monthlyReportStatusRegistry = sqliteTable(
  'monthly_report_status_registry',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    rawStatus: text('raw_status').notNull().unique(),
    displayStatus: text('display_status').notNull(),
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
    index('monthly_report_status_registry_raw_status_idx').on(table.rawStatus),
    index('monthly_report_status_registry_display_status_idx').on(table.displayStatus),
    index('monthly_report_status_registry_is_active_idx').on(table.isActive),
  ],
);

export type MonthlyReportStatusRegistry = typeof monthlyReportStatusRegistry.$inferSelect;
export type InsertMonthlyReportStatusRegistry = typeof monthlyReportStatusRegistry.$inferInsert;
