import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const warRooms = sqliteTable(
  'war_rooms',
  {
    requestId: integer('request_id').primaryKey(), // Request ID as primary key
    requestIdLink: text('request_id_link').notNull(), // URL link to the request/incident
    application: text('application').notNull(), // Application name (FFVV, Somos Belcorp, etc.)
    date: integer('date', { mode: 'timestamp' }).notNull(), // Date as timestamp
    summary: text('summary').notNull(), // Incident summary
    initialPriority: text('initial_priority').notNull(), // CRITICAL, HIGH, MEDIUM, LOW
    startTime: integer('start_time', { mode: 'timestamp' }).notNull(), // Start time as timestamp
    durationMinutes: integer('duration_minutes').notNull(), // Duration in minutes
    endTime: integer('end_time', { mode: 'timestamp' }).notNull(), // End time as timestamp
    participants: integer('participants').notNull(), // Number of participants
    status: text('status').notNull(), // Closed, Open, etc.
    priorityChanged: text('priority_changed').notNull(), // Yes/No
    resolutionTeamChanged: text('resolution_team_changed').notNull(), // Yes/No
    notes: text('notes').notNull(), // Additional notes
    rcaStatus: text('rca_status').notNull(), // RCA completion status
    urlRca: text('url_rca').notNull(), // URL to RCA document
  },
  (table) => [
    index('war_rooms_application_idx').on(table.application),
    index('war_rooms_status_idx').on(table.status),
    index('war_rooms_priority_idx').on(table.initialPriority),
    index('war_rooms_date_idx').on(table.date),
  ],
);

export type WarRoom = typeof warRooms.$inferSelect;
export type InsertWarRoom = typeof warRooms.$inferInsert;
