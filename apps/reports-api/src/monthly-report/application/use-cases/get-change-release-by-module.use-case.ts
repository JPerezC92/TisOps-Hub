import type {
  IMonthlyReportRepository,
  ChangeReleaseByModuleResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class GetChangeReleaseByModuleUseCase {
  constructor(private readonly repository: IMonthlyReportRepository) {}

  async execute(app?: string, month?: string): Promise<ChangeReleaseByModuleResult> {
    return this.repository.findChangeReleaseByModule(app, month);
  }
}
