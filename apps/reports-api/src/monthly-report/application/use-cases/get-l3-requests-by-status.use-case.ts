import { Injectable, Inject } from '@nestjs/common';
import {
  IMonthlyReportRepository,
  MONTHLY_REPORT_REPOSITORY,
  L3RequestsByStatusResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetL3RequestsByStatusUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_REPOSITORY)
    private readonly repository: IMonthlyReportRepository,
  ) {}

  async execute(app?: string): Promise<L3RequestsByStatusResult> {
    return this.repository.findL3RequestsByStatus(app);
  }
}
