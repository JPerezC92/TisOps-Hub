import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusNotFoundError } from '@monthly-report-status-registry/domain/errors/monthly-report-status-not-found.error';

export class DeleteMonthlyReportStatusUseCase {
  constructor(private readonly repository: IMonthlyReportStatusRegistryRepository) {}

  async execute(id: number): Promise<void | MonthlyReportStatusNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new MonthlyReportStatusNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
