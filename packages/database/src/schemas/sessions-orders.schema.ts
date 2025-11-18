import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// Main table for incidents, sessions, and orders data (Hoja1)
export const sessionsOrders = sqliteTable(
  'sessions_orders',
  {
    id: integer('id').primaryKey({ autoIncrement: true }), // Auto-increment ID
    ano: integer('ano').notNull(), // Year (2024, 2025, etc.)
    mes: integer('mes').notNull(), // Month (1-12)
    peak: integer('peak').notNull(), // Peak indicator (0 or 1)
    dia: integer('dia').notNull(), // Excel date serial number
    incidentes: integer('incidentes').notNull(), // Number of incidents
    placedOrders: integer('placed_orders').notNull(), // Number of placed orders
    billedOrders: integer('billed_orders').notNull(), // Number of billed orders
  },
  (table) => [
    index('sessions_orders_ano_idx').on(table.ano),
    index('sessions_orders_mes_idx').on(table.mes),
    index('sessions_orders_dia_idx').on(table.dia),
  ],
);

// Table for release tracking data (Hoja3)
export const sessionsOrdersReleases = sqliteTable(
  'sessions_orders_releases',
  {
    id: integer('id').primaryKey({ autoIncrement: true }), // Auto-increment ID
    semana: text('semana').notNull(), // Week number or identifier
    aplicacion: text('aplicacion').notNull(), // Application (SB, FFVV)
    fecha: integer('fecha').notNull(), // Excel date serial number
    release: text('release').notNull(), // Release version
    ticketsCount: integer('tickets_count').notNull(), // Number of tickets
    ticketsData: text('tickets_data').notNull(), // JSON array of ticket IDs/numbers
  },
  (table) => [
    index('sessions_orders_releases_aplicacion_idx').on(table.aplicacion),
    index('sessions_orders_releases_semana_idx').on(table.semana),
    index('sessions_orders_releases_fecha_idx').on(table.fecha),
  ],
);

export type SessionsOrder = typeof sessionsOrders.$inferSelect;
export type InsertSessionsOrder = typeof sessionsOrders.$inferInsert;
export type SessionsOrdersRelease = typeof sessionsOrdersReleases.$inferSelect;
export type InsertSessionsOrdersRelease = typeof sessionsOrdersReleases.$inferInsert;
