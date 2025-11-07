import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const errorLogs = sqliteTable('error_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  errorType: text('error_type').notNull(),
  errorMessage: text('error_message').notNull(),
  stackTrace: text('stack_trace'),
  endpoint: text('endpoint'),
  method: text('method'),
  userId: text('user_id'),
  metadata: text('metadata'), // JSON stringified additional context
});

export type ErrorLog = typeof errorLogs.$inferSelect;
export type InsertErrorLog = typeof errorLogs.$inferInsert;
