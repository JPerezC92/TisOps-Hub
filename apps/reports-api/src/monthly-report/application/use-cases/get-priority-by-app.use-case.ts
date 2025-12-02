import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  PriorityByAppResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetPriorityByAppUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<PriorityByAppResult> {
    return this.repository.findPriorityByApp(app, month);
  }
}
