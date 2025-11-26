import { Module } from '@nestjs/common';
import { MonthlyReportController } from './monthly-report.controller';
import { MonthlyReportService } from './monthly-report.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { MonthlyReportRepository } from './infrastructure/repositories/monthly-report.repository';
import { MonthlyReportExcelParser } from './infrastructure/parsers/monthly-report-excel.parser';
import { MONTHLY_REPORT_REPOSITORY } from './domain/repositories/monthly-report.repository.interface';
import { GetAllMonthlyReportsUseCase } from './application/use-cases/get-all-monthly-reports.use-case';
import { DeleteAllMonthlyReportsUseCase } from './application/use-cases/delete-all-monthly-reports.use-case';
import { UploadAndParseMonthlyReportUseCase } from './application/use-cases/upload-and-parse-monthly-report.use-case';
import { GetCriticalIncidentsAnalyticsUseCase } from './application/use-cases/get-critical-incidents-analytics.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [MonthlyReportController],
  providers: [
    MonthlyReportService,
    MonthlyReportExcelParser,
    {
      provide: MONTHLY_REPORT_REPOSITORY,
      useClass: MonthlyReportRepository,
    },
    {
      provide: GetAllMonthlyReportsUseCase,
      useFactory: (repository: any) => new GetAllMonthlyReportsUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: DeleteAllMonthlyReportsUseCase,
      useFactory: (repository: any) => new DeleteAllMonthlyReportsUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: UploadAndParseMonthlyReportUseCase,
      useFactory: (repository: any) => new UploadAndParseMonthlyReportUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetCriticalIncidentsAnalyticsUseCase,
      useFactory: (repository: any) => new GetCriticalIncidentsAnalyticsUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
  ],
  exports: [MonthlyReportService],
})
export class MonthlyReportModule {}
