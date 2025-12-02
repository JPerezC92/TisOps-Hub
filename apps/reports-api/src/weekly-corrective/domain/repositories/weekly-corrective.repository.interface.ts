import { WeeklyCorrective, InsertWeeklyCorrective } from '@repo/database';

export const WEEKLY_CORRECTIVE_REPOSITORY = Symbol('WEEKLY_CORRECTIVE_REPOSITORY');

export interface L3TicketsByStatusRow {
  application: string;
  statusCounts: Record<string, number>;
  total: number;
}

export interface L3TicketsByStatusResult {
  data: L3TicketsByStatusRow[];
  statusColumns: string[];
  monthName: string;
  totalL3Tickets: number;
}

export interface IWeeklyCorrectiveRepository {
  findAll(): Promise<WeeklyCorrective[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertWeeklyCorrective[]): Promise<void>;
  deleteAll(): Promise<number>;
  findL3TicketsByStatus(app?: string, month?: string): Promise<L3TicketsByStatusResult>;
}
