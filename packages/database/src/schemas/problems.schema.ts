import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

/**
 * Schema for XD PROBLEMAS NUEVOS report
 * Tracks problems/issues reported in ManageEngine
 */
export const problems = sqliteTable(
  'problems',
  {
    requestId: integer('request_id').primaryKey(), // Request ID as primary key
    requestIdLink: text('request_id_link'), // Hyperlink from Request ID column
    serviceCategory: text('service_category').notNull(), // Service Category (e.g., "Problemas")
    requestStatus: text('request_status').notNull(), // Request Status (e.g., "Evaluar")
    subject: text('subject').notNull(), // Problem subject/title
    subjectLink: text('subject_link'), // Hyperlink from Subject column
    createdTime: text('created_time').notNull(), // When the problem was created
    aplicativos: text('aplicativos').notNull(), // Application/System affected
    createdBy: text('created_by').notNull(), // Who created the problem
    technician: text('technician').notNull(), // Assigned technician
    planesDeAccion: text('planes_de_accion').notNull(), // Action plans
    observaciones: text('observaciones').notNull(), // Observations/notes
    dueByTime: text('due_by_time').notNull(), // Due date
  },
  (table) => [
    index('problems_aplicativos_idx').on(table.aplicativos),
    index('problems_created_by_idx').on(table.createdBy),
    index('problems_service_category_idx').on(table.serviceCategory),
  ],
);

export type Problem = typeof problems.$inferSelect;
export type InsertProblem = typeof problems.$inferInsert;
