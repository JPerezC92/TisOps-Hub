import { Injectable, Inject } from '@nestjs/common';
import {
  IMonthlyReportRepository,
  MONTHLY_REPORT_REPOSITORY,
  L3SummaryResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetL3SummaryUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_REPOSITORY)
    private readonly repository: IMonthlyReportRepository,
  ) {}

  async execute(app?: string): Promise<L3SummaryResult> {
    return this.repository.findL3Summary(app);
  }
}
