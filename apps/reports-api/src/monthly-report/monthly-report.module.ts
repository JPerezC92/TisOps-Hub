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
import { GetModuleEvolutionUseCase } from './application/use-cases/get-module-evolution.use-case';
import { GetStabilityIndicatorsUseCase } from './application/use-cases/get-stability-indicators.use-case';
import { GetCategoryDistributionUseCase } from './application/use-cases/get-category-distribution.use-case';
import { GetBusinessFlowPriorityUseCase } from './application/use-cases/get-business-flow-priority.use-case';
import { GetPriorityByAppUseCase } from './application/use-cases/get-priority-by-app.use-case';
import { GetIncidentsByWeekUseCase } from './application/use-cases/get-incidents-by-week.use-case';
import { GetIncidentOverviewByCategoryUseCase } from './application/use-cases/get-incident-overview-by-category.use-case';
import { GetL3SummaryUseCase } from './application/use-cases/get-l3-summary.use-case';
import { GetL3RequestsByStatusUseCase } from './application/use-cases/get-l3-requests-by-status.use-case';
import { GetMissingScopeByParentUseCase } from './application/use-cases/get-missing-scope-by-parent.use-case';
import { GetBugsByParentUseCase } from './application/use-cases/get-bugs-by-parent.use-case';
import { GetIncidentsByDayUseCase } from './application/use-cases/get-incidents-by-day.use-case';

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
    {
      provide: GetModuleEvolutionUseCase,
      useFactory: (repository: any) => new GetModuleEvolutionUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetStabilityIndicatorsUseCase,
      useFactory: (repository: any) => new GetStabilityIndicatorsUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetCategoryDistributionUseCase,
      useFactory: (repository: any) => new GetCategoryDistributionUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetBusinessFlowPriorityUseCase,
      useFactory: (repository: any) => new GetBusinessFlowPriorityUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetPriorityByAppUseCase,
      useFactory: (repository: any) => new GetPriorityByAppUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentsByWeekUseCase,
      useFactory: (repository: any) => new GetIncidentsByWeekUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentOverviewByCategoryUseCase,
      useFactory: (repository: any) => new GetIncidentOverviewByCategoryUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetL3SummaryUseCase,
      useFactory: (repository: any) => new GetL3SummaryUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetL3RequestsByStatusUseCase,
      useFactory: (repository: any) => new GetL3RequestsByStatusUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetMissingScopeByParentUseCase,
      useFactory: (repository: any) => new GetMissingScopeByParentUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetBugsByParentUseCase,
      useFactory: (repository: any) => new GetBugsByParentUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentsByDayUseCase,
      useFactory: (repository: any) => new GetIncidentsByDayUseCase(repository),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
  ],
  exports: [MonthlyReportService],
})
export class MonthlyReportModule {}
