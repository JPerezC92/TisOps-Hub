import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class DeleteAllMonthlyReportsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(): Promise<{ message: string; deleted: number }> {
    const deleted = await this.repository.deleteAll();

    return {
      message: 'All monthly report records deleted successfully',
      deleted,
    };
  }
}
