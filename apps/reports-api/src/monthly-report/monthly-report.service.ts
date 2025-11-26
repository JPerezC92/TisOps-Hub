import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { GetAllMonthlyReportsUseCase } from './application/use-cases/get-all-monthly-reports.use-case';
import { DeleteAllMonthlyReportsUseCase } from './application/use-cases/delete-all-monthly-reports.use-case';
import { UploadAndParseMonthlyReportUseCase } from './application/use-cases/upload-and-parse-monthly-report.use-case';
import { GetCriticalIncidentsAnalyticsUseCase } from './application/use-cases/get-critical-incidents-analytics.use-case';
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
}
