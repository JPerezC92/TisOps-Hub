import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  IncidentsByReleaseByDayResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetIncidentsByReleaseByDayUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<IncidentsByReleaseByDayResult> {
    return this.repository.findIncidentsByReleaseByDay(app, month);
  }
}
