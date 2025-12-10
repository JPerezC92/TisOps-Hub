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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MonthlyReportService } from './monthly-report.service';

@ApiTags('monthly-report')
@Controller('monthly-report')
export class MonthlyReportController {
  constructor(private readonly monthlyReportService: MonthlyReportService) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll() {
    return this.monthlyReportService.findAll();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get critical incidents analytics with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered critical incidents' })
  async getCriticalIncidentsAnalytics(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getCriticalIncidentsAnalytics(app, month);
  }

  @Get('module-evolution')
  @ApiOperation({ summary: 'Get incidents grouped by module with categorization breakdown' })
  @ApiResponse({ status: 200, description: 'Returns module evolution data with categorizations' })
  async getModuleEvolution(
    @Query('app') app?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.monthlyReportService.getModuleEvolution(app, startDate, endDate);
  }

  @Get('stability-indicators')
  @ApiOperation({ summary: 'Get stability indicators (L2/L3 counts) by application' })
  @ApiResponse({ status: 200, description: 'Returns stability indicators grouped by application' })
  async getStabilityIndicators(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getStabilityIndicators(app, month);
  }

  @Get('category-distribution')
  @ApiOperation({ summary: 'Get incident distribution by category with recurrency breakdown' })
  @ApiResponse({ status: 200, description: 'Returns category distribution with recurring/new/unassigned counts' })
  async getCategoryDistribution(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getCategoryDistribution(app, month);
  }

  @Get('business-flow-priority')
  @ApiOperation({ summary: 'Get incident counts by business-flow (module) grouped by priority' })
  @ApiResponse({ status: 200, description: 'Returns top 5 modules per priority level' })
  async getBusinessFlowPriority(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getBusinessFlowPriority(app, month);
  }

  @Get('priority-by-app')
  @ApiOperation({ summary: 'Get incident counts by application grouped by priority' })
  @ApiResponse({ status: 200, description: 'Returns priority breakdown per application' })
  async getPriorityByApp(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getPriorityByApp(app, month);
  }

  @Get('incidents-by-week')
  @ApiOperation({ summary: 'Get incident counts grouped by ISO week number' })
  @ApiResponse({ status: 200, description: 'Returns incidents count per week for the specified year' })
  async getIncidentsByWeek(
    @Query('app') app?: string,
    @Query('year') year?: string,
  ) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.monthlyReportService.getIncidentsByWeek(app, yearNum);
  }

  @Get('incidents-by-day')
  @ApiOperation({ summary: 'Get incident counts grouped by day of month' })
  @ApiResponse({ status: 200, description: 'Returns incidents count per day' })
  async getIncidentsByDay(
    @Query('app') app?: string,
  ) {
    return this.monthlyReportService.getIncidentsByDay(app);
  }

  @Get('incident-overview-by-category')
  @ApiOperation({ summary: 'Get incident overview grouped by category for 5 cards' })
  @ApiResponse({ status: 200, description: 'Returns incident overview data for Resolved in L2, Pending, Recurrent, L3 Backlog, and L3 Status' })
  async getIncidentOverviewByCategory(
    @Query('app') app?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.monthlyReportService.getIncidentOverviewByCategory(app, startDate, endDate);
  }

  @Get('l3-summary')
  @ApiOperation({ summary: 'Get L3 summary table with pending code fixes by status and priority' })
  @ApiResponse({ status: 200, description: 'Returns L3 summary data grouped by status with priority breakdown' })
  async getL3Summary(
    @Query('app') app?: string,
  ) {
    return this.monthlyReportService.getL3Summary(app);
  }

  @Get('l3-requests-by-status')
  @ApiOperation({ summary: 'Get L3 requests grouped by status with full details' })
  @ApiResponse({ status: 200, description: 'Returns L3 requests grouped by status (Dev in Progress, In Backlog, In Testing, PRD Deployment)' })
  async getL3RequestsByStatus(
    @Query('app') app?: string,
  ) {
    return this.monthlyReportService.getL3RequestsByStatus(app);
  }

  @Get('missing-scope-by-parent')
  @ApiOperation({ summary: 'Get distribution of missing scope incidents by parent ticket' })
  @ApiResponse({ status: 200, description: 'Returns missing scope incidents grouped by linked request ID with parent ticket details' })
  async getMissingScopeByParent(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getMissingScopeByParent(app, month);
  }

  @Get('bugs-by-parent')
  @ApiOperation({ summary: 'Get distribution of bug incidents by parent ticket' })
  @ApiResponse({ status: 200, description: 'Returns bug incidents grouped by linked request ID with parent ticket details' })
  async getBugsByParent(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getBugsByParent(app, month);
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
  @ApiResponse({ status: 201, description: 'File uploaded and parsed successfully' })
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

    return this.monthlyReportService.uploadAndParse(file.buffer);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all monthly report records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll() {
    return this.monthlyReportService.deleteAll();
  }
}
