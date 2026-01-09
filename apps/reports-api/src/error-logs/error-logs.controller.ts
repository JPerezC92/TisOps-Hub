import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { GetAllErrorLogsUseCase } from '@error-logs/application/use-cases/get-all-error-logs.use-case';
import { GetErrorLogByIdUseCase } from '@error-logs/application/use-cases/get-error-log-by-id.use-case';
import type { JSendSuccess } from '@repo/reports/common';
import type { ErrorLog } from '@repo/reports';

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
  @ApiResponse({ status: 200, description: 'Returns list of error logs' })
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<JSendSuccess<{ logs: ErrorLog[]; total: number }>> {
    const errorLogs = await this.getAllErrorLogsUseCase.execute(limit);
    const logs = errorLogs.map((log) => {
      const json = log.toJSON();
      return {
        ...json,
        timestamp: json.timestamp.toISOString(),
      };
    });
    return {
      status: 'success',
      data: {
        logs,
        total: logs.length,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get error log by ID' })
  @ApiResponse({ status: 200, description: 'Returns error log details' })
  @ApiResponse({ status: 404, description: 'Error log not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<JSendSuccess<ErrorLog>> {
    const errorLog = await this.getErrorLogByIdUseCase.execute(id);

    if (!errorLog) {
      throw new NotFoundException(`Error log with ID ${id} not found`);
    }

    const json = errorLog.toJSON();
    return {
      status: 'success',
      data: {
        ...json,
        timestamp: json.timestamp.toISOString(),
      },
    };
  }
}
