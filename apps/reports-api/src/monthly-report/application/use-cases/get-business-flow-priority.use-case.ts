import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  BusinessFlowPriorityResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetBusinessFlowPriorityUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<BusinessFlowPriorityResult> {
    return this.repository.findBusinessFlowByPriority(app, month);
  }
}
