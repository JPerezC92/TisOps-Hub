import { Module } from '@nestjs/common';
import { MonthlyReportController } from '@monthly-report/infrastructure/monthly-report.controller';
import { MonthlyReportRepository } from '@monthly-report/infrastructure/repositories/monthly-report.repository';
import { MonthlyReportExcelParser } from '@monthly-report/infrastructure/parsers/monthly-report-excel.parser';
import { MONTHLY_REPORT_REPOSITORY } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { GetAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/get-all-monthly-reports.use-case';
import { DeleteAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/delete-all-monthly-reports.use-case';
import { UploadAndParseMonthlyReportUseCase } from '@monthly-report/application/use-cases/upload-and-parse-monthly-report.use-case';
import { GetCriticalIncidentsAnalyticsUseCase } from '@monthly-report/application/use-cases/get-critical-incidents-analytics.use-case';
import { GetModuleEvolutionUseCase } from '@monthly-report/application/use-cases/get-module-evolution.use-case';
import { GetStabilityIndicatorsUseCase } from '@monthly-report/application/use-cases/get-stability-indicators.use-case';
import { GetCategoryDistributionUseCase } from '@monthly-report/application/use-cases/get-category-distribution.use-case';
import { GetBusinessFlowPriorityUseCase } from '@monthly-report/application/use-cases/get-business-flow-priority.use-case';
import { GetPriorityByAppUseCase } from '@monthly-report/application/use-cases/get-priority-by-app.use-case';
import { GetIncidentsByWeekUseCase } from '@monthly-report/application/use-cases/get-incidents-by-week.use-case';
import { GetIncidentOverviewByCategoryUseCase } from '@monthly-report/application/use-cases/get-incident-overview-by-category.use-case';
import { GetL3SummaryUseCase } from '@monthly-report/application/use-cases/get-l3-summary.use-case';
import { GetL3RequestsByStatusUseCase } from '@monthly-report/application/use-cases/get-l3-requests-by-status.use-case';
import { GetMissingScopeByParentUseCase } from '@monthly-report/application/use-cases/get-missing-scope-by-parent.use-case';
import { GetBugsByParentUseCase } from '@monthly-report/application/use-cases/get-bugs-by-parent.use-case';
import { GetIncidentsByDayUseCase } from '@monthly-report/application/use-cases/get-incidents-by-day.use-case';
import { GetIncidentsByReleaseByDayUseCase } from '@monthly-report/application/use-cases/get-incidents-by-release-by-day.use-case';
import { GetChangeReleaseByModuleUseCase } from '@monthly-report/application/use-cases/get-change-release-by-module.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MonthlyReportController],
  providers: [
    MonthlyReportExcelParser,
    {
      provide: MONTHLY_REPORT_REPOSITORY,
      useClass: MonthlyReportRepository,
    },
    {
      provide: GetAllMonthlyReportsUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetAllMonthlyReportsUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: DeleteAllMonthlyReportsUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new DeleteAllMonthlyReportsUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: UploadAndParseMonthlyReportUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new UploadAndParseMonthlyReportUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetCriticalIncidentsAnalyticsUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetCriticalIncidentsAnalyticsUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetModuleEvolutionUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetModuleEvolutionUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetStabilityIndicatorsUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetStabilityIndicatorsUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetCategoryDistributionUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetCategoryDistributionUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetBusinessFlowPriorityUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetBusinessFlowPriorityUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetPriorityByAppUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetPriorityByAppUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentsByWeekUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByWeekUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentOverviewByCategoryUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetIncidentOverviewByCategoryUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetL3SummaryUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetL3SummaryUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetL3RequestsByStatusUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetL3RequestsByStatusUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetMissingScopeByParentUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetMissingScopeByParentUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetBugsByParentUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetBugsByParentUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentsByDayUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByDayUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetIncidentsByReleaseByDayUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByReleaseByDayUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
    {
      provide: GetChangeReleaseByModuleUseCase,
      useFactory: (repo: IMonthlyReportRepository) => new GetChangeReleaseByModuleUseCase(repo),
      inject: [MONTHLY_REPORT_REPOSITORY],
    },
  ],
})
export class MonthlyReportModule {}
