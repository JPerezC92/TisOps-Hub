import type {
  IMonthlyReportRepository,
  IncidentOverviewByCategoryResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetIncidentOverviewByCategoryUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IncidentOverviewByCategoryResult> {
    return this.repository.findIncidentOverviewByCategory(app, startDate, endDate);
  }
}
