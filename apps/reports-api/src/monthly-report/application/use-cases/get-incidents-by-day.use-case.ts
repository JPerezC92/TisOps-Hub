import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  IncidentsByDayResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetIncidentsByDayUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string): Promise<IncidentsByDayResult> {
    return this.repository.findIncidentsByDay(app);
  }
}
