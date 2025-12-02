import { Inject, Injectable } from '@nestjs/common';
import {
  MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
  CreateMonthlyReportStatusDto,
  IMonthlyReportStatusRegistryRepository,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

@Injectable()
export class CreateMonthlyReportStatusUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: IMonthlyReportStatusRegistryRepository,
  ) {}

  async execute(data: CreateMonthlyReportStatusDto): Promise<MonthlyReportStatus> {
    return this.repository.create(data);
  }
}
