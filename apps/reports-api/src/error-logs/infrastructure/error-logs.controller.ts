import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { errorLogSchema, errorLogListResponseSchema } from '@repo/reports';
import { jsendSuccess, jsendFailSchema } from '@repo/reports/common';
import { DomainError } from '@shared/domain/errors/domain.error';
import { GetAllErrorLogsUseCase } from '@error-logs/application/use-cases/get-all-error-logs.use-case';
import { GetErrorLogByIdUseCase } from '@error-logs/application/use-cases/get-error-log-by-id.use-case';

// JSend success DTOs
class JSendErrorLogListDto extends createZodDto(jsendSuccess(errorLogListResponseSchema)) {}
class JSendErrorLogDto extends createZodDto(jsendSuccess(errorLogSchema)) {}

// JSend fail DTO
class JSendFailDto extends createZodDto(jsendFailSchema) {}

@ApiTags('error-logs')
@Controller('error-logs')
export class ErrorLogsController {
  constructor(
    private readonly getAllErrorLogsUseCase: GetAllErrorLogsUseCase,
    private readonly getErrorLogByIdUseCase: GetErrorLogByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all error logs' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records to return (default: 100)',
  })
  @ZodResponse({ status: 200, description: 'Returns list of error logs', type: JSendErrorLogListDto })
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const errorLogs = await this.getAllErrorLogsUseCase.execute(limit);
    const logs = errorLogs.map((log) => log.toJSON());
    return { status: 'success' as const, data: { logs, total: logs.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get error log by ID' })
  @ZodResponse({ status: 200, description: 'Returns error log details', type: JSendErrorLogDto })
  @ApiResponse({ status: 404, description: 'Error log not found', type: JSendFailDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getErrorLogByIdUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }
}
