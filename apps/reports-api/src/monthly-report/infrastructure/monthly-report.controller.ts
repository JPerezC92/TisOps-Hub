import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  moRepGetAllResponseSchema,
  moRepUploadResultSchema,
  moRepDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
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
import { MonthlyReportExcelParser } from '@monthly-report/infrastructure/parsers/monthly-report-excel.parser';

// JSend success DTOs
class JSendMoRepGetAllDto extends createZodDto(jsendSuccess(moRepGetAllResponseSchema)) {}
class JSendMoRepUploadResultDto extends createZodDto(jsendSuccess(moRepUploadResultSchema)) {}
class JSendMoRepDeleteResultDto extends createZodDto(jsendSuccess(moRepDeleteResultSchema)) {}

@ApiTags('monthly-report')
@Controller('monthly-report')
export class MonthlyReportController {
  constructor(
    private readonly getAllUseCase: GetAllMonthlyReportsUseCase,
    private readonly deleteAllUseCase: DeleteAllMonthlyReportsUseCase,
    private readonly uploadAndParseUseCase: UploadAndParseMonthlyReportUseCase,
    private readonly getCriticalIncidentsAnalyticsUseCase: GetCriticalIncidentsAnalyticsUseCase,
    private readonly getModuleEvolutionUseCase: GetModuleEvolutionUseCase,
    private readonly getStabilityIndicatorsUseCase: GetStabilityIndicatorsUseCase,
    private readonly getCategoryDistributionUseCase: GetCategoryDistributionUseCase,
    private readonly getBusinessFlowPriorityUseCase: GetBusinessFlowPriorityUseCase,
    private readonly getPriorityByAppUseCase: GetPriorityByAppUseCase,
    private readonly getIncidentsByWeekUseCase: GetIncidentsByWeekUseCase,
    private readonly getIncidentOverviewByCategoryUseCase: GetIncidentOverviewByCategoryUseCase,
    private readonly getL3SummaryUseCase: GetL3SummaryUseCase,
    private readonly getL3RequestsByStatusUseCase: GetL3RequestsByStatusUseCase,
    private readonly getMissingScopeByParentUseCase: GetMissingScopeByParentUseCase,
    private readonly getBugsByParentUseCase: GetBugsByParentUseCase,
    private readonly getIncidentsByDayUseCase: GetIncidentsByDayUseCase,
    private readonly getIncidentsByReleaseByDayUseCase: GetIncidentsByReleaseByDayUseCase,
    private readonly getChangeReleaseByModuleUseCase: GetChangeReleaseByModuleUseCase,
    private readonly excelParser: MonthlyReportExcelParser,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report records' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendMoRepGetAllDto })
  async findAll() {
    const data = await this.getAllUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get critical incidents analytics with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered critical incidents' })
  async getCriticalIncidentsAnalytics(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getCriticalIncidentsAnalyticsUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('module-evolution')
  @ApiOperation({ summary: 'Get incidents grouped by module with categorization breakdown' })
  @ApiResponse({ status: 200, description: 'Returns module evolution data with categorizations' })
  async getModuleEvolution(
    @Query('app') app?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.getModuleEvolutionUseCase.execute(app, startDate, endDate);
    return { status: 'success' as const, data };
  }

  @Get('stability-indicators')
  @ApiOperation({ summary: 'Get stability indicators (L2/L3 counts) by application' })
  @ApiResponse({ status: 200, description: 'Returns stability indicators grouped by application' })
  async getStabilityIndicators(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getStabilityIndicatorsUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('category-distribution')
  @ApiOperation({ summary: 'Get incident distribution by category with recurrency breakdown' })
  @ApiResponse({ status: 200, description: 'Returns category distribution with recurring/new/unassigned counts' })
  async getCategoryDistribution(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getCategoryDistributionUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('business-flow-priority')
  @ApiOperation({ summary: 'Get incident counts by business-flow (module) grouped by priority' })
  @ApiResponse({ status: 200, description: 'Returns top 5 modules per priority level' })
  async getBusinessFlowPriority(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getBusinessFlowPriorityUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('priority-by-app')
  @ApiOperation({ summary: 'Get incident counts by application grouped by priority' })
  @ApiResponse({ status: 200, description: 'Returns priority breakdown per application' })
  async getPriorityByApp(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getPriorityByAppUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('incidents-by-week')
  @ApiOperation({ summary: 'Get incident counts grouped by ISO week number' })
  @ApiResponse({ status: 200, description: 'Returns incidents count per week for the specified year' })
  async getIncidentsByWeek(
    @Query('app') app?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const data = await this.getIncidentsByWeekUseCase.execute(app, yearNum);
    return { status: 'success' as const, data };
  }

  @Get('incidents-by-day')
  @ApiOperation({ summary: 'Get incident counts grouped by day of month' })
  @ApiResponse({ status: 200, description: 'Returns incidents count per day' })
  async getIncidentsByDay(
    @Query('app') app?: string,
  ) {
    const data = await this.getIncidentsByDayUseCase.execute(app);
    return { status: 'success' as const, data };
  }

  @Get('incident-overview-by-category')
  @ApiOperation({ summary: 'Get incident overview grouped by category for 5 cards' })
  @ApiResponse({ status: 200, description: 'Returns incident overview data for Resolved in L2, Pending, Recurrent, L3 Backlog, and L3 Status' })
  async getIncidentOverviewByCategory(
    @Query('app') app?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.getIncidentOverviewByCategoryUseCase.execute(app, startDate, endDate);
    return { status: 'success' as const, data };
  }

  @Get('l3-summary')
  @ApiOperation({ summary: 'Get L3 summary table with pending code fixes by status and priority' })
  @ApiResponse({ status: 200, description: 'Returns L3 summary data grouped by status with priority breakdown' })
  async getL3Summary(
    @Query('app') app?: string,
  ) {
    const data = await this.getL3SummaryUseCase.execute(app);
    return { status: 'success' as const, data };
  }

  @Get('l3-requests-by-status')
  @ApiOperation({ summary: 'Get L3 requests grouped by status with full details' })
  @ApiResponse({ status: 200, description: 'Returns L3 requests grouped by status (Dev in Progress, In Backlog, In Testing, PRD Deployment)' })
  async getL3RequestsByStatus(
    @Query('app') app?: string,
  ) {
    const data = await this.getL3RequestsByStatusUseCase.execute(app);
    return { status: 'success' as const, data };
  }

  @Get('missing-scope-by-parent')
  @ApiOperation({ summary: 'Get distribution of missing scope incidents by parent ticket' })
  @ApiResponse({ status: 200, description: 'Returns missing scope incidents grouped by linked request ID with parent ticket details' })
  async getMissingScopeByParent(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getMissingScopeByParentUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('bugs-by-parent')
  @ApiOperation({ summary: 'Get distribution of bug incidents by parent ticket' })
  @ApiResponse({ status: 200, description: 'Returns bug incidents grouped by linked request ID with parent ticket details' })
  async getBugsByParent(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getBugsByParentUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('incidents-by-release-by-day')
  @ApiOperation({ summary: 'Get daily incident counts with Error por Cambio breakdown' })
  @ApiResponse({ status: 200, description: 'Returns incidents per day with total, incidents (excluding Error por Cambio), and Error por Cambio count' })
  async getIncidentsByReleaseByDay(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getIncidentsByReleaseByDayUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Get('change-release-by-module')
  @ApiOperation({ summary: 'Get Error por Cambio incidents grouped by module' })
  @ApiResponse({ status: 200, description: 'Returns Error por Cambio incident counts per module' })
  async getChangeReleaseByModule(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getChangeReleaseByModuleUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse XD 2025 DATA INFORME MENSUAL - Current Month.xlsx file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendMoRepUploadResultDto })
  @ApiResponse({ status: 400, description: 'Invalid file or format' })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new HttpException(
        'Invalid file type. Only Excel files are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const records = this.excelParser.parse(file.buffer);
      const data = await this.uploadAndParseUseCase.execute(records);
      return { status: 'success' as const, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all monthly report records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendMoRepDeleteResultDto })
  async deleteAll() {
    const data = await this.deleteAllUseCase.execute();
    return { status: 'success' as const, data };
  }
}
