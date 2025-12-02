import { Inject, Injectable } from '@nestjs/common';
import {
  MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
  IMonthlyReportStatusRegistryRepository,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';

@Injectable()
export class DeleteMonthlyReportStatusUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: IMonthlyReportStatusRegistryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
