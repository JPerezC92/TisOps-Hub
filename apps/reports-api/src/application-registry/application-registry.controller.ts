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
import { ApplicationRegistryService } from './application-registry.service';
import type {
  CreateApplicationDto,
  UpdateApplicationDto,
  CreatePatternDto,
  ApplicationWithPatterns,
} from './domain/repositories/application-registry.repository.interface';
import type { Application } from './domain/entities/application.entity';
import type { ApplicationPattern } from './domain/entities/application-pattern.entity';
import type { JSendSuccess } from '@repo/reports/common';

@ApiTags('application-registry')
@Controller('application-registry')
export class ApplicationRegistryController {
  constructor(
    private readonly applicationRegistryService: ApplicationRegistryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered applications' })
  @ApiResponse({ status: 200, description: 'Returns all active applications' })
  async findAll(): Promise<JSendSuccess<Application[]>> {
    const result = await this.applicationRegistryService.findAll();
    return { status: 'success', data: result };
  }

  @Get('with-patterns')
  @ApiOperation({ summary: 'Get all applications with their patterns' })
  @ApiResponse({
    status: 200,
    description: 'Returns all applications with patterns',
  })
  async findAllWithPatterns(): Promise<JSendSuccess<ApplicationWithPatterns[]>> {
    const result = await this.applicationRegistryService.findAllWithPatterns();
    return { status: 'success', data: result };
  }

  @Get('match')
  @ApiOperation({ summary: 'Find application by name pattern matching' })
  @ApiQuery({
    name: 'name',
    required: true,
    description: 'Application name to match',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns matched application or null',
  })
  async findByName(@Query('name') name: string): Promise<JSendSuccess<Application | null>> {
    const result = await this.applicationRegistryService.findByName(name);
    return { status: 'success', data: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Returns the application' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<Application>> {
    const result = await this.applicationRegistryService.findById(id);
    return { status: 'success', data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Create new application' })
  @ApiResponse({ status: 201, description: 'Application created successfully' })
  async create(@Body() data: CreateApplicationDto): Promise<JSendSuccess<Application>> {
    const result = await this.applicationRegistryService.create(data);
    return { status: 'success', data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application updated successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateApplicationDto,
  ): Promise<JSendSuccess<Application>> {
    const result = await this.applicationRegistryService.update(id, data);
    return { status: 'success', data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application (soft delete)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application deleted successfully' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<JSendSuccess<{ message: string }>> {
    await this.applicationRegistryService.delete(id);
    return { status: 'success', data: { message: 'Application deleted successfully' } };
  }

  @Post(':id/patterns')
  @ApiOperation({ summary: 'Add pattern to application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 201, description: 'Pattern created successfully' })
  async createPattern(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Omit<CreatePatternDto, 'applicationId'>,
  ): Promise<JSendSuccess<ApplicationPattern>> {
    const result = await this.applicationRegistryService.createPattern({
      ...data,
      applicationId: id,
    });
    return { status: 'success', data: result };
  }

  @Delete('patterns/:patternId')
  @ApiOperation({ summary: 'Delete pattern' })
  @ApiParam({ name: 'patternId', description: 'Pattern ID' })
  @ApiResponse({ status: 200, description: 'Pattern deleted successfully' })
  @ApiResponse({ status: 404, description: 'Pattern not found' })
  async deletePattern(@Param('patternId', ParseIntPipe) patternId: number): Promise<JSendSuccess<{ message: string }>> {
    await this.applicationRegistryService.deletePattern(patternId);
    return { status: 'success', data: { message: 'Pattern deleted successfully' } };
  }
}
