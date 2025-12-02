import { Module } from '@nestjs/common';
import { MonthlyReportStatusRegistryController } from './monthly-report-status-registry.controller';
import { MonthlyReportStatusRegistryService } from './monthly-report-status-registry.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { MonthlyReportStatusRegistryRepository } from './infrastructure/repositories/monthly-report-status-registry.repository';
import { MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY } from './domain/repositories/monthly-report-status-registry.repository.interface';
import { GetAllMonthlyReportStatusesUseCase } from './application/use-cases/get-all-monthly-report-statuses.use-case';
import { GetMonthlyReportStatusByIdUseCase } from './application/use-cases/get-monthly-report-status-by-id.use-case';
import { CreateMonthlyReportStatusUseCase } from './application/use-cases/create-monthly-report-status.use-case';
import { UpdateMonthlyReportStatusUseCase } from './application/use-cases/update-monthly-report-status.use-case';
import { DeleteMonthlyReportStatusUseCase } from './application/use-cases/delete-monthly-report-status.use-case';
import { MapRawStatusUseCase } from './application/use-cases/map-raw-status.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [MonthlyReportStatusRegistryController],
  providers: [
    MonthlyReportStatusRegistryService,
    {
      provide: MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
      useClass: MonthlyReportStatusRegistryRepository,
    },
    {
      provide: GetAllMonthlyReportStatusesUseCase,
      useFactory: (repository: any) => new GetAllMonthlyReportStatusesUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetMonthlyReportStatusByIdUseCase,
      useFactory: (repository: any) => new GetMonthlyReportStatusByIdUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateMonthlyReportStatusUseCase,
      useFactory: (repository: any) => new CreateMonthlyReportStatusUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateMonthlyReportStatusUseCase,
      useFactory: (repository: any) => new UpdateMonthlyReportStatusUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteMonthlyReportStatusUseCase,
      useFactory: (repository: any) => new DeleteMonthlyReportStatusUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: MapRawStatusUseCase,
      useFactory: (repository: any) => new MapRawStatusUseCase(repository),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
  ],
  exports: [MonthlyReportStatusRegistryService],
})
export class MonthlyReportStatusRegistryModule {}
