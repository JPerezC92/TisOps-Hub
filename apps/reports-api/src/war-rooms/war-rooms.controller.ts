import {
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { WarRoomsService } from './war-rooms.service';
import type { JSendSuccess } from '@repo/reports/common';

@ApiTags('war-rooms')
@Controller('war-rooms')
export class WarRoomsController {
  constructor(private readonly warRoomsService: WarRoomsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all war rooms records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll(): Promise<JSendSuccess<{ data: any[]; total: number }>> {
    const result = await this.warRoomsService.findAll();
    return { status: 'success', data: result };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get filtered war rooms records for analytics dashboard' })
  @ApiResponse({ status: 200, description: 'Returns filtered records' })
  async getAnalytics(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ): Promise<JSendSuccess<any>> {
    const result = await this.warRoomsService.getAnalytics(app, month);
    return { status: 'success', data: result };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse EDWarRooms2025.xlsx file' })
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
  async uploadFile(@UploadedFile() file: any): Promise<JSendSuccess<{ message: string; imported: number; total: number }>> {
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

    const result = await this.warRoomsService.uploadAndParse(file.buffer);
    return { status: 'success', data: result };
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all war rooms records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll(): Promise<JSendSuccess<{ message: string; deleted: number }>> {
    const result = await this.warRoomsService.deleteAll();
    return { status: 'success', data: result };
  }
}
