import { MonthlyReport, InsertMonthlyReport } from '@repo/database';

export const MONTHLY_REPORT_REPOSITORY = Symbol('MONTHLY_REPORT_REPOSITORY');

export interface IMonthlyReportRepository {
  findAll(): Promise<MonthlyReport[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertMonthlyReport[]): Promise<void>;
  deleteAll(): Promise<number>;
  findCriticalIncidentsFiltered(app?: string, month?: string): Promise<MonthlyReport[]>;
}
