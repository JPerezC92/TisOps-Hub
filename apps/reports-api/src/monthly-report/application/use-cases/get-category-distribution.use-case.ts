import type {
  IMonthlyReportRepository,
  CategoryDistributionResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetCategoryDistributionUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<CategoryDistributionResult> {
    return this.repository.findCategoryDistribution(app, month);
  }
}
