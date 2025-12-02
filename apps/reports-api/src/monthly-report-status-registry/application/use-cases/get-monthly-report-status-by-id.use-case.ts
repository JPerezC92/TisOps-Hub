import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
  IMonthlyReportStatusRegistryRepository,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

@Injectable()
export class GetMonthlyReportStatusByIdUseCase {
  constructor(
    @Inject(MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: IMonthlyReportStatusRegistryRepository,
  ) {}

  async execute(id: number): Promise<MonthlyReportStatus> {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Monthly report status with ID ${id} not found`);
    }
    return status;
  }
}
