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
import { MonthlyReportStatusRegistryService } from './monthly-report-status-registry.service';
import type {
  CreateMonthlyReportStatusDto,
  UpdateMonthlyReportStatusDto,
} from './domain/repositories/monthly-report-status-registry.repository.interface';

@ApiTags('monthly-report-status-registry')
@Controller('monthly-report-status-registry')
export class MonthlyReportStatusRegistryController {
  constructor(
    private readonly monthlyReportStatusRegistryService: MonthlyReportStatusRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report status mappings' })
  @ApiResponse({ status: 200, description: 'Returns all active status mappings' })
  async findAll() {
    return this.monthlyReportStatusRegistryService.findAll();
  }

  @Get('map')
  @ApiOperation({ summary: 'Map raw status to display status' })
  @ApiQuery({
    name: 'status',
    required: true,
    description: 'Raw status to map',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the mapped display status',
  })
  async mapStatus(@Query('status') status: string) {
    const displayStatus = await this.monthlyReportStatusRegistryService.mapRawStatus(status);
    return { rawStatus: status, displayStatus };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monthly report status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Returns the status mapping' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.monthlyReportStatusRegistryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new monthly report status mapping' })
  @ApiResponse({ status: 201, description: 'Status mapping created successfully' })
  async create(@Body() data: CreateMonthlyReportStatusDto) {
    return this.monthlyReportStatusRegistryService.create(data);
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
    return this.monthlyReportStatusRegistryService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete monthly report status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.monthlyReportStatusRegistryService.delete(id);
    return { message: 'Monthly report status mapping deleted successfully' };
  }
}
