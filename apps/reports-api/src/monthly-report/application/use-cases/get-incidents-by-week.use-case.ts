import type {
  IMonthlyReportRepository,
  IncidentsByWeekResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetIncidentsByWeekUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, year?: number): Promise<IncidentsByWeekResult> {
    return this.repository.findIncidentsByWeek(app, year);
  }
}
