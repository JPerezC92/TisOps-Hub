import type {
  IMonthlyReportRepository,
  StabilityIndicatorsResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetStabilityIndicatorsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<StabilityIndicatorsResult> {
    return this.repository.findStabilityIndicators(app, month);
  }
}
