import type {
  IMonthlyReportRepository,
  L3SummaryResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetL3SummaryUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string): Promise<L3SummaryResult> {
    return this.repository.findL3Summary(app);
  }
}
