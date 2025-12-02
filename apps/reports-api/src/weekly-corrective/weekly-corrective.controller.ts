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
import { WeeklyCorrectiveService } from './weekly-corrective.service';

@ApiTags('weekly-corrective')
@Controller('weekly-corrective')
export class WeeklyCorrectiveController {
  constructor(private readonly weeklyCorrectiveService: WeeklyCorrectiveService) {}

  @Get()
  @ApiOperation({ summary: 'Get all weekly corrective records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll() {
    return this.weeklyCorrectiveService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse XD SEMANAL CORRECTIVO.xlsx file' })
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

    return this.weeklyCorrectiveService.uploadAndParse(file.buffer);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all weekly corrective records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll() {
    return this.weeklyCorrectiveService.deleteAll();
  }

  @Get('l3-tickets-by-status')
  @ApiOperation({ summary: 'Get L3 ticket counts by status grouped by application' })
  @ApiResponse({ status: 200, description: 'Returns L3 tickets grouped by status and application' })
  async getL3TicketsByStatus(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    return this.weeklyCorrectiveService.getL3TicketsByStatus(app, month);
  }
}
