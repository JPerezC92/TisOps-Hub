import type {
  IMonthlyReportRepository,
  IncidentsByDayResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetIncidentsByDayUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string): Promise<IncidentsByDayResult> {
    return this.repository.findIncidentsByDay(app);
  }
}
