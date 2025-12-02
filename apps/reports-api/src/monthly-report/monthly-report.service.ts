import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
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
import { MonthlyReportExcelParser } from './infrastructure/parsers/monthly-report-excel.parser';

@Injectable()
export class MonthlyReportService {
  constructor(
    @Inject(GetAllMonthlyReportsUseCase)
    private readonly getAllUseCase: GetAllMonthlyReportsUseCase,
    @Inject(DeleteAllMonthlyReportsUseCase)
    private readonly deleteAllUseCase: DeleteAllMonthlyReportsUseCase,
    @Inject(UploadAndParseMonthlyReportUseCase)
    private readonly uploadAndParseUseCase: UploadAndParseMonthlyReportUseCase,
    @Inject(GetCriticalIncidentsAnalyticsUseCase)
    private readonly getCriticalIncidentsAnalyticsUseCase: GetCriticalIncidentsAnalyticsUseCase,
    @Inject(GetModuleEvolutionUseCase)
    private readonly getModuleEvolutionUseCase: GetModuleEvolutionUseCase,
    @Inject(GetStabilityIndicatorsUseCase)
    private readonly getStabilityIndicatorsUseCase: GetStabilityIndicatorsUseCase,
    @Inject(GetCategoryDistributionUseCase)
    private readonly getCategoryDistributionUseCase: GetCategoryDistributionUseCase,
    @Inject(GetBusinessFlowPriorityUseCase)
    private readonly getBusinessFlowPriorityUseCase: GetBusinessFlowPriorityUseCase,
    @Inject(GetPriorityByAppUseCase)
    private readonly getPriorityByAppUseCase: GetPriorityByAppUseCase,
    @Inject(GetIncidentsByWeekUseCase)
    private readonly getIncidentsByWeekUseCase: GetIncidentsByWeekUseCase,
    private readonly excelParser: MonthlyReportExcelParser,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async deleteAll() {
    return this.deleteAllUseCase.execute();
  }

  async uploadAndParse(buffer: Buffer) {
    try {
      // Infrastructure: Parse Excel
      const records = this.excelParser.parse(buffer);

      // Application: Execute business logic
      return await this.uploadAndParseUseCase.execute(records);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getCriticalIncidentsAnalytics(app?: string, month?: string) {
    return this.getCriticalIncidentsAnalyticsUseCase.execute(app, month);
  }

  async getModuleEvolution(app?: string, startDate?: string, endDate?: string) {
    return this.getModuleEvolutionUseCase.execute(app, startDate, endDate);
  }

  async getStabilityIndicators(app?: string, month?: string) {
    return this.getStabilityIndicatorsUseCase.execute(app, month);
  }

  async getCategoryDistribution(app?: string, month?: string) {
    return this.getCategoryDistributionUseCase.execute(app, month);
  }

  async getBusinessFlowPriority(app?: string, month?: string) {
    return this.getBusinessFlowPriorityUseCase.execute(app, month);
  }

  async getPriorityByApp(app?: string, month?: string) {
    return this.getPriorityByAppUseCase.execute(app, month);
  }

  async getIncidentsByWeek(app?: string, year?: number) {
    return this.getIncidentsByWeekUseCase.execute(app, year);
  }
}
