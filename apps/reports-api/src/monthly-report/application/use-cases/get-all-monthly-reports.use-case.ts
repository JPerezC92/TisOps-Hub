import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { MonthlyReport } from '@repo/database';

export class GetAllMonthlyReportsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(): Promise<{ data: MonthlyReport[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.countAll(),
    ]);

    return { data, total };
  }
}
