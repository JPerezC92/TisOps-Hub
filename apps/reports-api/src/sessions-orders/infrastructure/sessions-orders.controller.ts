import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  sessOrdGetAllResponseSchema,
  sessOrdUploadResultSchema,
  sessOrdDeleteResultSchema,
  sessOrdLast30DaysResponseSchema,
  sessOrdIncidentsVsOrdersResponseSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { GetAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/get-all-sessions-orders.use-case';
import { DeleteAllSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/delete-all-sessions-orders.use-case';
import { UploadAndParseSessionsOrdersUseCase } from '@sessions-orders/application/use-cases/upload-and-parse-sessions-orders.use-case';
import { GetLast30DaysUseCase } from '@sessions-orders/application/use-cases/get-last-30-days.use-case';
import { GetIncidentsVsOrdersByMonthUseCase } from '@sessions-orders/application/use-cases/get-incidents-vs-orders-by-month.use-case';
import { SessionsOrdersExcelParser } from '@sessions-orders/infrastructure/parsers/sessions-orders-excel.parser';

// JSend success DTOs
class JSendSessOrdGetAllDto extends createZodDto(jsendSuccess(sessOrdGetAllResponseSchema)) {}
class JSendSessOrdUploadResultDto extends createZodDto(jsendSuccess(sessOrdUploadResultSchema)) {}
class JSendSessOrdDeleteResultDto extends createZodDto(jsendSuccess(sessOrdDeleteResultSchema)) {}
class JSendSessOrdLast30DaysDto extends createZodDto(jsendSuccess(sessOrdLast30DaysResponseSchema)) {}
class JSendSessOrdIncidentsVsOrdersDto extends createZodDto(jsendSuccess(sessOrdIncidentsVsOrdersResponseSchema)) {}

@ApiTags('sessions-orders')
@Controller('sessions-orders')
export class SessionsOrdersController {
  constructor(
    private readonly getAllSessionsOrdersUseCase: GetAllSessionsOrdersUseCase,
    private readonly deleteAllSessionsOrdersUseCase: DeleteAllSessionsOrdersUseCase,
    private readonly uploadAndParseSessionsOrdersUseCase: UploadAndParseSessionsOrdersUseCase,
    private readonly getLast30DaysUseCase: GetLast30DaysUseCase,
    private readonly getIncidentsVsOrdersByMonthUseCase: GetIncidentsVsOrdersByMonthUseCase,
    private readonly excelParser: SessionsOrdersExcelParser,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions/orders records (both sheets)' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendSessOrdGetAllDto })
  async findAll() {
    const data = await this.getAllSessionsOrdersUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse SB INCIDENTES ORDENES SESIONES.xlsx file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendSessOrdUploadResultDto })
  @ApiResponse({ status: 400, description: 'Invalid file or format' })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }

    if (
      !file.originalname.endsWith('.xlsx') &&
      !file.originalname.endsWith('.xls')
    ) {
      throw new HttpException(
        'Invalid file type. Only Excel files are allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const { mainRecords, releaseRecords } = this.excelParser.parse(file.buffer);
      const data = await this.uploadAndParseSessionsOrdersUseCase.execute(mainRecords, releaseRecords);
      return { status: 'success' as const, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all sessions/orders records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendSessOrdDeleteResultDto })
  async deleteAll() {
    const data = await this.deleteAllSessionsOrdersUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('last-30-days')
  @ApiOperation({ summary: 'Get sessions and orders data for the last 30 records' })
  @ZodResponse({ status: 200, description: 'Returns sessions/orders data with day, incidents, sessions, and placed orders', type: JSendSessOrdLast30DaysDto })
  async getLast30Days() {
    const data = await this.getLast30DaysUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('incidents-vs-orders-by-month')
  @ApiOperation({ summary: 'Get incidents vs placed orders aggregated by month' })
  @ZodResponse({ status: 200, description: 'Returns incidents and placed orders grouped by month', type: JSendSessOrdIncidentsVsOrdersDto })
  async getIncidentsVsOrdersByMonth(@Query('year') year?: string) {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const data = await this.getIncidentsVsOrdersByMonthUseCase.execute(yearNum);
    return { status: 'success' as const, data };
  }
}
