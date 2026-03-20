import type {
  IMonthlyReportRepository,
  BugsByParentResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetBugsByParentUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<BugsByParentResult> {
    return this.repository.findBugsByParent(app, month);
  }
}
