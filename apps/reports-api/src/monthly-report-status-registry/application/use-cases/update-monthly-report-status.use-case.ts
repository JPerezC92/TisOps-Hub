import { Inject, Injectable } from '@nestjs/common';
import {
  MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
  IMonthlyReportStatusRegistryRepository,
  UpdateMonthlyReportStatusDto,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

@Injectable()
export class UpdateMonthlyReportStatusUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: IMonthlyReportStatusRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateMonthlyReportStatusDto): Promise<MonthlyReportStatus> {
    return this.repository.update(id, data);
  }
}
