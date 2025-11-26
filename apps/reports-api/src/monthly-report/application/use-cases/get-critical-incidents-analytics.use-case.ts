import { Injectable } from '@nestjs/common';
import type { MonthlyReport } from '@repo/database';
import type { IMonthlyReportRepository } from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetCriticalIncidentsAnalyticsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<MonthlyReport[]> {
    return this.repository.findCriticalIncidentsFiltered(app, month);
  }
}
