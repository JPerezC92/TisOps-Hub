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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SessionsOrdersService } from './sessions-orders.service';
import type { JSendSuccess } from '@repo/reports/common';

@ApiTags('sessions-orders')
@Controller('sessions-orders')
export class SessionsOrdersController {
  constructor(private readonly sessionsOrdersService: SessionsOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions/orders records (both sheets)' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll(): Promise<JSendSuccess<any>> {
    const result = await this.sessionsOrdersService.findAll();
    return { status: 'success', data: result };
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
  @ApiResponse({ status: 201, description: 'File uploaded and parsed successfully' })
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

    const result = await this.sessionsOrdersService.uploadAndParse(file.buffer);
    return { status: 'success', data: result };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all sessions/orders records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll(): Promise<JSendSuccess<any>> {
    const result = await this.sessionsOrdersService.deleteAll();
    return { status: 'success', data: result };
  }

  @Get('last-30-days')
  @ApiOperation({ summary: 'Get sessions and orders data for the last 30 records' })
  @ApiResponse({ status: 200, description: 'Returns sessions/orders data with day, incidents, sessions, and placed orders' })
  async getLast30Days(): Promise<JSendSuccess<any>> {
    const result = await this.sessionsOrdersService.getLast30Days();
    return { status: 'success', data: result };
  }

  @Get('incidents-vs-orders-by-month')
  @ApiOperation({ summary: 'Get incidents vs placed orders aggregated by month' })
  @ApiResponse({ status: 200, description: 'Returns incidents and placed orders grouped by month' })
  async getIncidentsVsOrdersByMonth(@Query('year') year?: string): Promise<JSendSuccess<any>> {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const result = await this.sessionsOrdersService.getIncidentsVsOrdersByMonth(yearNum);
    return { status: 'success', data: result };
  }
}
