import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  IncidentOverviewByCategoryResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
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
