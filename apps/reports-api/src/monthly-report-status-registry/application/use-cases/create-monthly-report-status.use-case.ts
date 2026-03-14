import {
  CreateMonthlyReportStatusDto,
  IMonthlyReportStatusRegistryRepository,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

export class CreateMonthlyReportStatusUseCase {
  constructor(private readonly repository: IMonthlyReportStatusRegistryRepository) {}

  async execute(data: CreateMonthlyReportStatusDto): Promise<MonthlyReportStatus> {
    return this.repository.create(data);
  }
}
