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
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  correctiveStatusSchema,
  correctiveStatusArraySchema,
  correctiveStatusDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess, jsendFailSchema } from '@repo/reports/common';
import { z } from 'zod';
import { DomainError } from '@shared/domain/errors/domain.error';
import type {
  CreateCorrectiveStatusDto,
  UpdateCorrectiveStatusDto,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { GetAllCorrectiveStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { GetDistinctDisplayStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-distinct-display-statuses.use-case';
import { CreateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/delete-corrective-status.use-case';

// JSend success DTOs — used by both @ZodSerializerDto (runtime) and @ApiResponse (Swagger)
class JSendCorrectiveStatusArrayDto extends createZodDto(jsendSuccess(correctiveStatusArraySchema)) {}
class JSendCorrectiveStatusDto extends createZodDto(jsendSuccess(correctiveStatusSchema)) {}
class JSendCorrectiveStatusDeleteResultDto extends createZodDto(jsendSuccess(correctiveStatusDeleteResultSchema)) {}
class JSendDisplayStatusArrayDto extends createZodDto(jsendSuccess(z.array(z.string()))) {}

// JSend fail DTO — used by @ApiResponse for error documentation
class JSendFailDto extends createZodDto(jsendFailSchema) {}

@ApiTags('corrective-status-registry')
@Controller('corrective-status-registry')
export class CorrectiveStatusRegistryController {
  constructor(
    private readonly getAllCorrectiveStatusesUseCase: GetAllCorrectiveStatusesUseCase,
    private readonly getCorrectiveStatusByIdUseCase: GetCorrectiveStatusByIdUseCase,
    private readonly getDistinctDisplayStatusesUseCase: GetDistinctDisplayStatusesUseCase,
    private readonly createCorrectiveStatusUseCase: CreateCorrectiveStatusUseCase,
    private readonly updateCorrectiveStatusUseCase: UpdateCorrectiveStatusUseCase,
    private readonly deleteCorrectiveStatusUseCase: DeleteCorrectiveStatusUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all corrective status mappings' })
  @ZodResponse({ status: 200, description: 'Returns all active status mappings', type: JSendCorrectiveStatusArrayDto })
  async findAll() {
    const data = await this.getAllCorrectiveStatusesUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('display-statuses')
  @ApiOperation({ summary: 'Get distinct display statuses for dropdown' })
  @ZodResponse({ status: 200, description: 'Returns distinct display status values', type: JSendDisplayStatusArrayDto })
  async getDistinctDisplayStatuses() {
    const data = await this.getDistinctDisplayStatusesUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get corrective status mapping by ID' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ZodResponse({ status: 200, description: 'Returns the status mapping', type: JSendCorrectiveStatusDto })
  @ApiResponse({ status: 404, description: 'Status mapping not found', type: JSendFailDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getCorrectiveStatusByIdUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Create new corrective status mapping' })
  @ZodResponse({ status: 201, description: 'Status mapping created successfully', type: JSendCorrectiveStatusDto })
  async create(@Body() data: CreateCorrectiveStatusDto) {
    const result = await this.createCorrectiveStatusUseCase.execute(data);
    return { status: 'success' as const, data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update corrective status mapping' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ZodResponse({ status: 200, description: 'Status mapping updated successfully', type: JSendCorrectiveStatusDto })
  @ApiResponse({ status: 404, description: 'Status mapping not found', type: JSendFailDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateCorrectiveStatusDto,
  ) {
    const result = await this.updateCorrectiveStatusUseCase.execute(id, data);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete corrective status mapping (soft delete)' })
  @ApiParam({ name: 'id', description: 'Status mapping ID' })
  @ZodResponse({ status: 200, description: 'Status mapping deleted successfully', type: JSendCorrectiveStatusDeleteResultDto })
  @ApiResponse({ status: 404, description: 'Status mapping not found', type: JSendFailDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteCorrectiveStatusUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: { deleted: true } };
  }
}
