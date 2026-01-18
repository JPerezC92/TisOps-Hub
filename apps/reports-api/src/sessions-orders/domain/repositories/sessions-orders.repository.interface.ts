import type { SessionsOrder, SessionsOrdersRelease, InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';

export const SESSIONS_ORDERS_REPOSITORY = Symbol('SESSIONS_ORDERS_REPOSITORY');

// Last 30 Days interfaces
export interface SessionsOrdersLast30DaysRow {
  day: string;         // "Day 27"
  date: string;        // "2025-01-27"
  incidents: number;
  sessions: number;
  placedOrders: number;
}

export interface SessionsOrdersLast30DaysResult {
  data: SessionsOrdersLast30DaysRow[];
}

// Incidents vs Orders by Month interfaces
export interface IncidentsVsOrdersByMonthRow {
  month: string;       // "Jan", "Feb", etc.
  monthNumber: number; // 1-12 for sorting
  incidents: number;
  placedOrders: number;
}

export interface IncidentsVsOrdersByMonthResult {
  data: IncidentsVsOrdersByMonthRow[];
}

export interface ISessionsOrdersRepository {
  findAllMain(): Promise<SessionsOrder[]>;
  findAllReleases(): Promise<SessionsOrdersRelease[]>;
  countMain(): Promise<number>;
  countReleases(): Promise<number>;
  bulkCreateMain(records: InsertSessionsOrder[]): Promise<void>;
  bulkCreateReleases(records: InsertSessionsOrdersRelease[]): Promise<void>;
  deleteAllMain(): Promise<number>;
  deleteAllReleases(): Promise<number>;
  findLast30Days(): Promise<SessionsOrdersLast30DaysResult>;
  findIncidentsVsOrdersByMonth(year?: number): Promise<IncidentsVsOrdersByMonthResult>;
}
