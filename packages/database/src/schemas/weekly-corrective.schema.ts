import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const weeklyCorrectives = sqliteTable(
  'weekly_correctives',
  {
    requestId: text('request_id').primaryKey(), // Request ID as primary key
    technician: text('technician').notNull(), // Assigned technician
    aplicativos: text('aplicativos').notNull(), // Application name
    categorizacion: text('categorizacion').notNull(), // Categorization
    createdTime: text('created_time').notNull(), // "07/07/2025 12:40"
    requestStatus: text('request_status').notNull(), // Status (En Pruebas, etc.)
    modulo: text('modulo').notNull(), // Module
    subject: text('subject').notNull(), // Subject/description
    priority: text('priority').notNull(), // Baja, Media, Alta
    eta: text('eta').notNull(), // ETA date/time
    rca: text('rca').notNull(), // RCA URL or "No asignado"
  },
  (table) => [
    index('weekly_correctives_technician_idx').on(table.technician),
    index('weekly_correctives_aplicativos_idx').on(table.aplicativos),
    index('weekly_correctives_categorizacion_idx').on(table.categorizacion),
    index('weekly_correctives_status_idx').on(table.requestStatus),
    index('weekly_correctives_priority_idx').on(table.priority),
  ],
);

export type WeeklyCorrective = typeof weeklyCorrectives.$inferSelect;
export type InsertWeeklyCorrective = typeof weeklyCorrectives.$inferInsert;
