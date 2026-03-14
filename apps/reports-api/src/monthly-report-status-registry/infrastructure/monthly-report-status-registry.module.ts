import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY } from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { MonthlyReportStatusRegistryRepository } from '@monthly-report-status-registry/infrastructure/repositories/monthly-report-status-registry.repository';
import { MonthlyReportStatusRegistryController } from '@monthly-report-status-registry/infrastructure/monthly-report-status-registry.controller';
import { GetAllMonthlyReportStatusesUseCase } from '@monthly-report-status-registry/application/use-cases/get-all-monthly-report-statuses.use-case';
import { GetMonthlyReportStatusByIdUseCase } from '@monthly-report-status-registry/application/use-cases/get-monthly-report-status-by-id.use-case';
import { MapRawStatusUseCase } from '@monthly-report-status-registry/application/use-cases/map-raw-status.use-case';
import { CreateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/create-monthly-report-status.use-case';
import { UpdateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/update-monthly-report-status.use-case';
import { DeleteMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/delete-monthly-report-status.use-case';

@Module({
  controllers: [MonthlyReportStatusRegistryController],
  providers: [
    {
      provide: MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY,
      useFactory: (db) => new MonthlyReportStatusRegistryRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllMonthlyReportStatusesUseCase,
      useFactory: (repo) => new GetAllMonthlyReportStatusesUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetMonthlyReportStatusByIdUseCase,
      useFactory: (repo) => new GetMonthlyReportStatusByIdUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: MapRawStatusUseCase,
      useFactory: (repo) => new MapRawStatusUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateMonthlyReportStatusUseCase,
      useFactory: (repo) => new CreateMonthlyReportStatusUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateMonthlyReportStatusUseCase,
      useFactory: (repo) => new UpdateMonthlyReportStatusUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteMonthlyReportStatusUseCase,
      useFactory: (repo) => new DeleteMonthlyReportStatusUseCase(repo),
      inject: [MONTHLY_REPORT_STATUS_REGISTRY_REPOSITORY],
    },
  ],
})
export class MonthlyReportStatusRegistryModule {}
