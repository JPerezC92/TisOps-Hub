import { Injectable, Inject } from '@nestjs/common';
import {
  IMonthlyReportRepository,
  MONTHLY_REPORT_REPOSITORY,
  MissingScopeByParentResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class GetMissingScopeByParentUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_REPOSITORY)
    private readonly repository: IMonthlyReportRepository,
  ) {}

  async execute(app?: string, month?: string): Promise<MissingScopeByParentResult> {
    return this.repository.findMissingScopeByParent(app, month);
  }
}
