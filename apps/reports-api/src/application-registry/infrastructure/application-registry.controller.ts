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
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  appRegistryApplicationSchema,
  appRegistryApplicationArraySchema,
  appRegistryPatternSchema,
  appRegistryWithPatternsArraySchema,
  appRegistryDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess, jsendFailSchema } from '@repo/reports/common';
import { z } from 'zod';
import { DomainError } from '@shared/domain/errors/domain.error';
import type {
  CreateApplicationDto,
  UpdateApplicationDto,
  CreatePatternDto,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { GetAllApplicationsUseCase } from '@application-registry/application/use-cases/get-all-applications.use-case';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import { FindApplicationByNameUseCase } from '@application-registry/application/use-cases/find-application-by-name.use-case';
import { GetApplicationsWithPatternsUseCase } from '@application-registry/application/use-cases/get-applications-with-patterns.use-case';
import { CreateApplicationUseCase } from '@application-registry/application/use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from '@application-registry/application/use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from '@application-registry/application/use-cases/delete-application.use-case';
import { CreatePatternUseCase } from '@application-registry/application/use-cases/create-pattern.use-case';
import { DeletePatternUseCase } from '@application-registry/application/use-cases/delete-pattern.use-case';

// JSend success DTOs
class JSendApplicationArrayDto extends createZodDto(jsendSuccess(appRegistryApplicationArraySchema)) {}
class JSendApplicationDto extends createZodDto(jsendSuccess(appRegistryApplicationSchema)) {}
class JSendApplicationNullableDto extends createZodDto(jsendSuccess(appRegistryApplicationSchema.nullable())) {}
class JSendWithPatternsArrayDto extends createZodDto(jsendSuccess(appRegistryWithPatternsArraySchema)) {}
class JSendPatternDto extends createZodDto(jsendSuccess(appRegistryPatternSchema)) {}
class JSendDeleteResultDto extends createZodDto(jsendSuccess(appRegistryDeleteResultSchema)) {}

// JSend fail DTO
class JSendFailDto extends createZodDto(jsendFailSchema) {}

@ApiTags('application-registry')
@Controller('application-registry')
export class ApplicationRegistryController {
  constructor(
    private readonly getAllApplicationsUseCase: GetAllApplicationsUseCase,
    private readonly getApplicationByIdUseCase: GetApplicationByIdUseCase,
    private readonly findApplicationByNameUseCase: FindApplicationByNameUseCase,
    private readonly getApplicationsWithPatternsUseCase: GetApplicationsWithPatternsUseCase,
    private readonly createApplicationUseCase: CreateApplicationUseCase,
    private readonly updateApplicationUseCase: UpdateApplicationUseCase,
    private readonly deleteApplicationUseCase: DeleteApplicationUseCase,
    private readonly createPatternUseCase: CreatePatternUseCase,
    private readonly deletePatternUseCase: DeletePatternUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered applications' })
  @ZodResponse({ status: 200, description: 'Returns all active applications', type: JSendApplicationArrayDto })
  async findAll() {
    const data = await this.getAllApplicationsUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('with-patterns')
  @ApiOperation({ summary: 'Get all applications with their patterns' })
  @ZodResponse({ status: 200, description: 'Returns all applications with patterns', type: JSendWithPatternsArrayDto })
  async findAllWithPatterns() {
    const data = await this.getApplicationsWithPatternsUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('match')
  @ApiOperation({ summary: 'Find application by name pattern matching' })
  @ApiQuery({ name: 'name', required: true, description: 'Application name to match' })
  @ZodResponse({ status: 200, description: 'Returns matched application or null', type: JSendApplicationNullableDto })
  async findByName(@Query('name') name: string) {
    const data = await this.findApplicationByNameUseCase.execute(name);
    return { status: 'success' as const, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ZodResponse({ status: 200, description: 'Returns the application', type: JSendApplicationDto })
  @ApiResponse({ status: 404, description: 'Application not found', type: JSendFailDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getApplicationByIdUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Create new application' })
  @ZodResponse({ status: 201, description: 'Application created successfully', type: JSendApplicationDto })
  async create(@Body() data: CreateApplicationDto) {
    const result = await this.createApplicationUseCase.execute(data);
    return { status: 'success' as const, data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ZodResponse({ status: 200, description: 'Application updated successfully', type: JSendApplicationDto })
  @ApiResponse({ status: 404, description: 'Application not found', type: JSendFailDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateApplicationDto,
  ) {
    const result = await this.updateApplicationUseCase.execute(id, data);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application (soft delete)' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ZodResponse({ status: 200, description: 'Application deleted successfully', type: JSendDeleteResultDto })
  @ApiResponse({ status: 404, description: 'Application not found', type: JSendFailDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteApplicationUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: { deleted: true } };
  }

  @Post(':id/patterns')
  @ApiOperation({ summary: 'Add pattern to application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ZodResponse({ status: 201, description: 'Pattern created successfully', type: JSendPatternDto })
  async createPattern(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Omit<CreatePatternDto, 'applicationId'>,
  ) {
    const result = await this.createPatternUseCase.execute({
      ...data,
      applicationId: id,
    });
    return { status: 'success' as const, data: result };
  }

  @Delete('patterns/:patternId')
  @ApiOperation({ summary: 'Delete pattern' })
  @ApiParam({ name: 'patternId', description: 'Pattern ID' })
  @ZodResponse({ status: 200, description: 'Pattern deleted successfully', type: JSendDeleteResultDto })
  @ApiResponse({ status: 404, description: 'Pattern not found', type: JSendFailDto })
  async deletePattern(@Param('patternId', ParseIntPipe) patternId: number) {
    const result = await this.deletePatternUseCase.execute(patternId);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: { deleted: true } };
  }
}
