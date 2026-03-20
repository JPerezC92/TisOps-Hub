import type {
  IMonthlyReportRepository,
  IncidentsByReleaseByDayResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetIncidentsByReleaseByDayUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<IncidentsByReleaseByDayResult> {
    return this.repository.findIncidentsByReleaseByDay(app, month);
  }
}
