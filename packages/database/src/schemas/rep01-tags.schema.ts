import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const rep01Tags = sqliteTable(
  'rep01_tags',
  {
    requestId: text('request_id').primaryKey(), // Request ID as primary key
    requestIdLink: text('request_id_link'), // Hyperlink to Request (from Excel cell)
    createdTime: text('created_time').notNull(), // "30/10/2025 15:42"
    informacionAdicional: text('informacion_adicional').notNull(), // Additional information
    modulo: text('modulo').notNull(), // Module/System area
    problemId: text('problem_id').notNull(), // Problem identifier
    linkedRequestId: text('linked_request_id').notNull(), // Related request
    linkedRequestIdLink: text('linked_request_id_link'), // Hyperlink to Linked Request (from Excel cell)
    jira: text('jira').notNull(), // Jira ticket reference
    categorizacion: text('categorizacion').notNull(), // Categorization/Tag
    technician: text('technician').notNull(), // Assigned technician
  },
  (table) => [
    index('rep01_problem_id_idx').on(table.problemId),
    index('rep01_linked_request_id_idx').on(table.linkedRequestId),
    index('rep01_categorizacion_idx').on(table.categorizacion),
    index('rep01_technician_idx').on(table.technician),
    index('rep01_modulo_idx').on(table.modulo),
  ],
);

export type Rep01Tag = typeof rep01Tags.$inferSelect;
export type InsertRep01Tag = typeof rep01Tags.$inferInsert;
