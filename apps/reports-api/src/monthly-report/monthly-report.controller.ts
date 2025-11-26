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
import { MonthlyReportService } from './monthly-report.service';

@ApiTags('monthly-report')
@Controller('monthly-report')
export class MonthlyReportController {
  constructor(private readonly monthlyReportService: MonthlyReportService) {}

  @Get()
  @ApiOperation({ summary: 'Get all monthly report records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll() {
    return this.monthlyReportService.findAll();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get critical incidents analytics with filters' })
  @ApiResponse({ status: 200, description: 'Returns filtered critical incidents' })
  async getCriticalIncidentsAnalytics(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.monthlyReportService.getCriticalIncidentsAnalytics(app, month);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse XD 2025 DATA INFORME MENSUAL - Current Month.xlsx file' })
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

    return this.monthlyReportService.uploadAndParse(file.buffer);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all monthly report records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll() {
    return this.monthlyReportService.deleteAll();
  }
}
