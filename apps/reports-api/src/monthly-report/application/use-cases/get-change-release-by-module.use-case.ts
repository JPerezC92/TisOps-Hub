import { Injectable } from '@nestjs/common';
import type {
  IMonthlyReportRepository,
  ChangeReleaseByModuleResult,
} from '../../domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetChangeReleaseByModuleUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<ChangeReleaseByModuleResult> {
    return this.repository.findChangeReleaseByModule(app, month);
  }
}
