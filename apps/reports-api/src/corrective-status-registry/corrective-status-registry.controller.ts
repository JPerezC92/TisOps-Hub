import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CorrectiveStatusRegistryService } from './corrective-status-registry.service';
import type {
  CreateCorrectiveStatusDto,
  UpdateCorrectiveStatusDto,
} from './domain/repositories/corrective-status-registry.repository.interface';

@ApiTags('corrective-status-registry')
@Controller('corrective-status-registry')
export class CorrectiveStatusRegistryController {
  constructor(
    private readonly correctiveStatusRegistryService: CorrectiveStatusRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all corrective status mappings' })
  @ApiResponse({ status: 200, description: 'Returns all active status mappings' })
  async findAll() {
    return this.correctiveStatusRegistryService.findAll();
  }

  @Get('display-statuses')
  @ApiOperation({ summary: 'Get distinct display statuses for dropdown' })
  @ApiResponse({
    status: 200,
    description: 'Returns distinct display status values',
  })
  async getDistinctDisplayStatuses() {
    return this.correctiveStatusRegistryService.getDistinctDisplayStatuses();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get corrective status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Returns the status mapping' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.correctiveStatusRegistryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new corrective status mapping' })
  @ApiResponse({ status: 201, description: 'Status mapping created successfully' })
  async create(@Body() data: CreateCorrectiveStatusDto) {
    return this.correctiveStatusRegistryService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update corrective status mapping' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping updated successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCorrectiveStatusDto,
  ) {
    return this.correctiveStatusRegistryService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete corrective status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ApiResponse({ status: 200, description: 'Status mapping deleted successfully' })
  @ApiResponse({ status: 404, description: 'Status mapping not found' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.correctiveStatusRegistryService.delete(id);
    return { message: 'Corrective status mapping deleted successfully' };
  }
}
