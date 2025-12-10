import { Injectable } from '@nestjs/common';
import type { MonthlyReport } from '@repo/database';
import type { IMonthlyReportRepository } from '../../domain/repositories/monthly-report.repository.interface';

// Flattened response type for frontend consumption
export interface CriticalIncidentResponse extends MonthlyReport {
  mappedModuleDisplayValue: string | null;
  mappedStatusDisplayValue: string | null;
  mappedCategorizationDisplayValue: string | null;
}

@Injectable()
export class GetCriticalIncidentsAnalyticsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<CriticalIncidentResponse[]> {
    const results = await this.repository.findCriticalIncidentsFiltered(app, month);

    // Flatten the response for frontend consumption
    return results.map((result) => ({
      ...result.monthlyReport,
      mappedModuleDisplayValue: result.mappedModuleDisplayValue,
      mappedStatusDisplayValue: result.mappedStatusDisplayValue,
      mappedCategorizationDisplayValue: result.mappedCategorizationDisplayValue,
    }));
  }
}
