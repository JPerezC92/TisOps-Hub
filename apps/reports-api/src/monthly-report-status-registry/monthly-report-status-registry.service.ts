import { Injectable, Inject } from '@nestjs/common';
import { GetAllMonthlyReportStatusesUseCase } from './application/use-cases/get-all-monthly-report-statuses.use-case';
import { GetMonthlyReportStatusByIdUseCase } from './application/use-cases/get-monthly-report-status-by-id.use-case';
import { CreateMonthlyReportStatusUseCase } from './application/use-cases/create-monthly-report-status.use-case';
import { UpdateMonthlyReportStatusUseCase } from './application/use-cases/update-monthly-report-status.use-case';
import { DeleteMonthlyReportStatusUseCase } from './application/use-cases/delete-monthly-report-status.use-case';
import { MapRawStatusUseCase } from './application/use-cases/map-raw-status.use-case';
import type {
  CreateMonthlyReportStatusDto,
  UpdateMonthlyReportStatusDto,
} from './domain/repositories/monthly-report-status-registry.repository.interface';

@Injectable()
export class MonthlyReportStatusRegistryService {
  constructor(
    @Inject(GetAllMonthlyReportStatusesUseCase)
    private readonly getAllUseCase: GetAllMonthlyReportStatusesUseCase,
    @Inject(GetMonthlyReportStatusByIdUseCase)
    private readonly getByIdUseCase: GetMonthlyReportStatusByIdUseCase,
    @Inject(CreateMonthlyReportStatusUseCase)
    private readonly createUseCase: CreateMonthlyReportStatusUseCase,
    @Inject(UpdateMonthlyReportStatusUseCase)
    private readonly updateUseCase: UpdateMonthlyReportStatusUseCase,
    @Inject(DeleteMonthlyReportStatusUseCase)
    private readonly deleteUseCase: DeleteMonthlyReportStatusUseCase,
    @Inject(MapRawStatusUseCase)
    private readonly mapRawStatusUseCase: MapRawStatusUseCase,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async findById(id: number) {
    return this.getByIdUseCase.execute(id);
  }

  async create(data: CreateMonthlyReportStatusDto) {
    return this.createUseCase.execute(data);
  }

  async update(id: number, data: UpdateMonthlyReportStatusDto) {
    return this.updateUseCase.execute(id, data);
  }

  async delete(id: number) {
    return this.deleteUseCase.execute(id);
  }

  async mapRawStatus(rawStatus: string) {
    return this.mapRawStatusUseCase.execute(rawStatus);
  }
}
