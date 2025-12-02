import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  StabilityIndicatorsResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetStabilityIndicatorsUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<StabilityIndicatorsResult> {
    return this.repository.findStabilityIndicators(app, month);
  }
}
