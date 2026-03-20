import type {
  IMonthlyReportRepository,
  BusinessFlowPriorityResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetBusinessFlowPriorityUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<BusinessFlowPriorityResult> {
    return this.repository.findBusinessFlowByPriority(app, month);
  }
}
