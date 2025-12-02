import { Inject, Injectable } from '@nestjs/common';
import {
  MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
  IMonthlyReportStatusRegistryRepository,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';

@Injectable()
export class MapRawStatusUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: IMonthlyReportStatusRegistryRepository,
  ) {}

  async execute(rawStatus: string): Promise<string> {
    const status = await this.repository.findByRawStatus(rawStatus);
    if (!status) {
      return 'In L3 Backlog';
    }
    return status.displayStatus;
  }
}
