import { MonthlyReportStatus } from '../entities/monthly-report-status.entity';

export interface CreateMonthlyReportStatusDto {
  rawStatus: string;
  displayStatus: string;
  isActive?: boolean;
}

export interface UpdateMonthlyReportStatusDto {
  rawStatus?: string;
  displayStatus?: string;
  isActive?: boolean;
}

export interface IMonthlyReportStatusRegistryRepository {
  findAll(): Promise<MonthlyReportStatus[]>;
  findById(id: number): Promise<MonthlyReportStatus | null>;
  findByRawStatus(rawStatus: string): Promise<MonthlyReportStatus | null>;
  create(data: CreateMonthlyReportStatusDto): Promise<MonthlyReportStatus>;
  update(id: number, data: UpdateMonthlyReportStatusDto): Promise<MonthlyReportStatus>;
  delete(id: number): Promise<void>;
}

export const MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY = Symbol(
  'MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY',
);
