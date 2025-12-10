import { Injectable, Inject } from '@nestjs/common';
import {
  IMonthlyReportRepository,
  MONTHLY_REPORT_REPOSITORY,
  BugsByParentResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetBugsByParentUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_REPOSITORY)
    private readonly repository: IMonthlyReportRepository,
  ) {}

  async execute(app?: string, month?: string): Promise<BugsByParentResult> {
    return this.repository.findBugsByParent(app, month);
  }
}
