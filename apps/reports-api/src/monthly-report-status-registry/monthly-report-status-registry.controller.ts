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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import type { JSendSuccess } from '@repo/reports/common';
import { MonthlyReportStatusRegistryService } from './monthly-report-status-registry.service';
import type {
  CreateMonthlyReportStatusDto,
  UpdateMonthlyReportStatusDto,
} from './domain/repositories/monthly-report-status-registry.repository.interface';
import type { MonthlyReportStatus } from './domain/entities/monthly-report-status.entity';

@ApiTags('monthly-report-status-registry')
@Controller('monthly-report-status-registry')
export class MonthlyReportStatusRegistryController {
  constructor(
    private readonly monthlyReportStatusRegistryService: MonthlyReportStatusRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report status mappings' })
  @ApiResponse({ status: 200, description: 'Returns all active status mappings' })
  async findAll(): Promise<JSendSuccess<MonthlyReportStatus[]>> {
    const statuses = await this.monthlyReportStatusRegistryService.findAll();
    return {
      status: 'success',
      data: statuses,
    };
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
  async mapStatus(@Query('status') status: string): Promise<JSendSuccess<{ rawStatus: string; displayStatus: string }>> {
    const displayStatus = await this.monthlyReportStatusRegistryService.mapRawStatus(status);
    return {
      status: 'success',
      data: { rawStatus: status, displayStatus },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get monthly report status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Returns the status mapping' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<MonthlyReportStatus>> {
    const statusMapping = await this.monthlyReportStatusRegistryService.findById(id);
    if (!statusMapping) {
      throw new NotFoundException(`Monthly report status with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: statusMapping,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new monthly report status mapping' })
  @ApiResponse({ status: 201, description: 'Status mapping created successfully' })
  async create(@Body() data: CreateMonthlyReportStatusDto): Promise<JSendSuccess<MonthlyReportStatus>> {
    const statusMapping = await this.monthlyReportStatusRegistryService.create(data);
    return {
      status: 'success',
      data: statusMapping,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update monthly report status mapping' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping updated successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMonthlyReportStatusDto,
  ): Promise<JSendSuccess<MonthlyReportStatus>> {
    const statusMapping = await this.monthlyReportStatusRegistryService.update(id, data);
    return {
      status: 'success',
      data: statusMapping,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete monthly report status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<{ deleted: boolean }>> {
    await this.monthlyReportStatusRegistryService.delete(id);
    return {
      status: 'success',
      data: { deleted: true },
    };
  }
}
