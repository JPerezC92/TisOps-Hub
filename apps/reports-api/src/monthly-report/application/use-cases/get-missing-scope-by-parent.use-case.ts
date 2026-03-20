import type {
  IMonthlyReportRepository,
  MissingScopeByParentResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetMissingScopeByParentUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<MissingScopeByParentResult> {
    return this.repository.findMissingScopeByParent(app, month);
  }
}
