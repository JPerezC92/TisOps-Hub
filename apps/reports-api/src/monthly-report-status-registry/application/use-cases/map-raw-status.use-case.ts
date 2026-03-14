import { IMonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';

export class MapRawStatusUseCase {
  constructor(private readonly repository: IMonthlyReportStatusRegistryRepository) {}

  async execute(rawStatus: string): Promise<string> {
    const status = await this.repository.findByRawStatus(rawStatus);
    if (!status) {
      return 'In L3 Backlog';
    }
    return status.displayStatus;
  }
}
