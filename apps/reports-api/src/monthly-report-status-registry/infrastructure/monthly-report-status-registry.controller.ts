import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type {
  CreateMonthlyReportStatusDto,
  UpdateMonthlyReportStatusDto,
} from '@monthly-report-status-registry/domain/repositories/monthly-report-status-registry.repository.interface';
import { GetAllMonthlyReportStatusesUseCase } from '@monthly-report-status-registry/application/use-cases/get-all-monthly-report-statuses.use-case';
import { GetMonthlyReportStatusByIdUseCase } from '@monthly-report-status-registry/application/use-cases/get-monthly-report-status-by-id.use-case';
import { MapRawStatusUseCase } from '@monthly-report-status-registry/application/use-cases/map-raw-status.use-case';
import { CreateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/create-monthly-report-status.use-case';
import { UpdateMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/update-monthly-report-status.use-case';
import { DeleteMonthlyReportStatusUseCase } from '@monthly-report-status-registry/application/use-cases/delete-monthly-report-status.use-case';

@ApiTags('monthly-report-status-registry')
@Controller('monthly-report-status-registry')
export class MonthlyReportStatusRegistryController {
  constructor(
    private readonly getAllMonthlyReportStatusesUseCase: GetAllMonthlyReportStatusesUseCase,
    private readonly getMonthlyReportStatusByIdUseCase: GetMonthlyReportStatusByIdUseCase,
    private readonly mapRawStatusUseCase: MapRawStatusUseCase,
    private readonly createMonthlyReportStatusUseCase: CreateMonthlyReportStatusUseCase,
    private readonly updateMonthlyReportStatusUseCase: UpdateMonthlyReportStatusUseCase,
    private readonly deleteMonthlyReportStatusUseCase: DeleteMonthlyReportStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report status mappings' })
  @ApiResponse({ status: 200, description: 'Returns all active status mappings' })
  async findAll() {
    return this.getAllMonthlyReportStatusesUseCase.execute();
  }

  @Get('map')
  @ApiOperation({ summary: 'Map raw status to display status' })
  @ApiQuery({ name: 'status', required: true, description: 'Raw status to map' })
  @ApiResponse({ status: 200, description: 'Returns the mapped display status' })
  async mapStatus(@Query('status') status: string) {
    const displayStatus = await this.mapRawStatusUseCase.execute(status);
    return { rawStatus: status, displayStatus };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monthly report status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Returns the status mapping' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.getMonthlyReportStatusByIdUseCase.execute(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new monthly report status mapping' })
  @ApiResponse({ status: 201, description: 'Status mapping created successfully' })
  async create(@Body() data: CreateMonthlyReportStatusDto) {
    return this.createMonthlyReportStatusUseCase.execute(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update monthly report status mapping' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping updated successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMonthlyReportStatusDto,
  ) {
    return this.updateMonthlyReportStatusUseCase.execute(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete monthly report status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteMonthlyReportStatusUseCase.execute(id);
    return result ?? { deleted: true };
  }
}
