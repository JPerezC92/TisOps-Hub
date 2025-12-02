import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  CategoryDistributionResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetCategoryDistributionUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<CategoryDistributionResult> {
    return this.repository.findCategoryDistribution(app, month);
  }
}
