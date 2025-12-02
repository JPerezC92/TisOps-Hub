import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  IncidentsByWeekResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetIncidentsByWeekUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, year?: number): Promise<IncidentsByWeekResult> {
    return this.repository.findIncidentsByWeek(app, year);
  }
}
