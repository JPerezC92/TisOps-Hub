import { sqliteTable, int, text, index } from 'drizzle-orm/sqlite-core';

export const requestCategorization = sqliteTable(
  'request_categorization',
  {
    id: int().primaryKey({ autoIncrement: true }),
    category: text().notNull(), // Error de Alcance, Error de codificación (Bug), Error de datos (Data Source)
    technician: text().notNull(),
    requestId: text().notNull(),
    requestIdLink: text(),
    createdTime: text().notNull(),
    modulo: text().notNull(),
    subject: text().notNull(),
    problemId: text().notNull(),
    linkedRequestId: text().notNull(),
    linkedRequestIdLink: text(),
  },
  (table) => [
    index('rc_category_idx').on(table.category),
    index('rc_request_id_idx').on(table.requestId),
    index('rc_technician_idx').on(table.technician),
  ],
);

export type RequestCategorization = typeof requestCategorization.$inferSelect;
export type InsertRequestCategorization = typeof requestCategorization.$inferInsert;
