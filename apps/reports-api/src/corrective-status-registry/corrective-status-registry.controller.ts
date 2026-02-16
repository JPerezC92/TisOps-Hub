import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { JSendSuccess } from '@repo/reports/common';
import { CorrectiveStatusRegistryService } from './corrective-status-registry.service';
import type {
  CreateCorrectiveStatusDto,
  UpdateCorrectiveStatusDto,
} from './domain/repositories/corrective-status-registry.repository.interface';
import type { CorrectiveStatus } from './domain/entities/corrective-status.entity';

@ApiTags('corrective-status-registry')
@Controller('corrective-status-registry')
export class CorrectiveStatusRegistryController {
  constructor(
    private readonly correctiveStatusRegistryService: CorrectiveStatusRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all corrective status mappings' })
  @ApiResponse({ status: 200, description: 'Returns all active status mappings' })
  async findAll(): Promise<JSendSuccess<CorrectiveStatus[]>> {
    const statuses = await this.correctiveStatusRegistryService.findAll();
    return {
      status: 'success',
      data: statuses,
    };
  }

  @Get('display-statuses')
  @ApiOperation({ summary: 'Get distinct display statuses for dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Returns distinct display status values',
  })
  async getDistinctDisplayStatuses(): Promise<JSendSuccess<string[]>> {
    const options = await this.correctiveStatusRegistryService.getDistinctDisplayStatuses();
    return {
      status: 'success',
      data: options,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get corrective status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Returns the status mapping' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<CorrectiveStatus>> {
    const status = await this.correctiveStatusRegistryService.findById(id);
    if (!status) {
      throw new NotFoundException(`Corrective status with ID ${id} not found`);
    }
    return {
      status: 'success',
      data: status,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create new corrective status mapping' })
  @ApiResponse({ status: 201, description: 'Status mapping created successfully' })
  async create(@Body() data: CreateCorrectiveStatusDto): Promise<JSendSuccess<CorrectiveStatus>> {
    const status = await this.correctiveStatusRegistryService.create(data);
    return {
      status: 'success',
      data: status,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update corrective status mapping' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping updated successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCorrectiveStatusDto,
  ): Promise<JSendSuccess<CorrectiveStatus>> {
    const status = await this.correctiveStatusRegistryService.update(id, data);
    return {
      status: 'success',
      data: status,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete corrective status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<{ deleted: boolean }>> {
    await this.correctiveStatusRegistryService.delete(id);
    return {
      status: 'success',
      data: { deleted: true },
    };
  }
}
