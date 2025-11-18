import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const monthlyReports = sqliteTable(
  'monthly_reports',
  {
    requestId: integer('request_id').primaryKey(), // Request ID as primary key
    aplicativos: text('aplicativos').notNull(), // Application name
    categorizacion: text('categorizacion').notNull(), // Categorization
    createdTime: text('created_time').notNull(), // "06/11/2025 13:38"
    requestStatus: text('request_status').notNull(), // Status (Nivel 2, Validado, Dev in Progress, etc.)
    modulo: text('modulo').notNull(), // Module
    subject: text('subject').notNull(), // Subject/description
    priority: text('priority').notNull(), // Alta, Baja, Media
    eta: text('eta').notNull(), // ETA date/time or "No asignado"
    informacionAdicional: text('informacion_adicional').notNull(), // Additional information
    resolvedTime: text('resolved_time').notNull(), // Resolved date/time or "No asignado"
    paisesAfectados: text('paises_afectados').notNull(), // Affected countries
    recurrencia: text('recurrencia').notNull(), // Recurrence status
    technician: text('technician').notNull(), // Assigned technician
    jira: text('jira').notNull(), // Jira ticket
    problemId: text('problem_id').notNull(), // Problem ID
    linkedRequestId: text('linked_request_id').notNull(), // Linked request
    requestOlaStatus: text('request_ola_status').notNull(), // OLA status (Violated, Not Violated)
    grupoEscalamiento: text('grupo_escalamiento').notNull(), // Escalation group
    aplicactivosAfectados: text('aplicactivos_afectados').notNull(), // Affected applications
    nivelUno: text('nivel_uno').notNull(), // Should be resolved at Level 1?
    campana: text('campana').notNull(), // Campaign
    cuv: text('cuv').notNull(), // CUV identifier
    release: text('release').notNull(), // Release version
    rca: text('rca').notNull(), // RCA link or status
  },
  (table) => [
    index('monthly_reports_aplicativos_idx').on(table.aplicativos),
    index('monthly_reports_categorizacion_idx').on(table.categorizacion),
    index('monthly_reports_status_idx').on(table.requestStatus),
    index('monthly_reports_priority_idx').on(table.priority),
    index('monthly_reports_technician_idx').on(table.technician),
    index('monthly_reports_created_time_idx').on(table.createdTime),
  ],
);

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;
