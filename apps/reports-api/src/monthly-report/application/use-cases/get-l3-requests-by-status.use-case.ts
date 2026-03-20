import type {
  IMonthlyReportRepository,
  L3RequestsByStatusResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetL3RequestsByStatusUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string): Promise<L3RequestsByStatusResult> {
    return this.repository.findL3RequestsByStatus(app);
  }
}
