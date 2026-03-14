import {
  IMonthlyReportStatusRegistryRepository,
  UpdateMonthlyReportStatusDto,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';

export class UpdateMonthlyReportStatusUseCase {
  constructor(private readonly repository: IMonthlyReportStatusRegistryRepository) {}

  async execute(id: number, data: UpdateMonthlyReportStatusDto): Promise<MonthlyReportStatus | MonthlyReportStatusNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new MonthlyReportStatusNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}
