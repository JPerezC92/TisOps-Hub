import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';

export class GetMonthlyReportStatusByIdUseCase {
  constructor(private readonly repository: IMonthlyReportStatusRegistryRepository) {}

  async execute(id: number): Promise<MonthlyReportStatus | MonthlyReportStatusNotFoundError> {
    const status = await this.repository.findById(id);
    if (!status) {
      return new MonthlyReportStatusNotFoundError(id);
    }
    return status;
  }
}
