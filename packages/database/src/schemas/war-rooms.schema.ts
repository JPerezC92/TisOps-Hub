import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const warRooms = sqliteTable(
  'war_rooms',
  {
    incidentId: integer('incident_id').primaryKey(), // Incident ID as primary key
    application: text('application').notNull(), // Application name (FFVV, Somos Belcorp, etc.)
    date: integer('date').notNull(), // Excel date serial number
    summary: text('summary').notNull(), // Incident summary
    initialPriority: text('initial_priority').notNull(), // CRITICAL, HIGH, MEDIUM, LOW
    startTime: real('start_time').notNull(), // Excel time serial (fraction of day)
    durationMinutes: integer('duration_minutes').notNull(), // Duration in minutes
    endTime: real('end_time').notNull(), // Excel time serial (fraction of day)
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
