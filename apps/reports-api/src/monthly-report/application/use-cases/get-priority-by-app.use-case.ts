import type {
  IMonthlyReportRepository,
  PriorityByAppResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetPriorityByAppUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<PriorityByAppResult> {
    return this.repository.findPriorityByApp(app, month);
  }
}
