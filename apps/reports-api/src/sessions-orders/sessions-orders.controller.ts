import {
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SessionsOrdersService } from './sessions-orders.service';

@ApiTags('sessions-orders')
@Controller('sessions-orders')
export class SessionsOrdersController {
  constructor(private readonly sessionsOrdersService: SessionsOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sessions/orders records (both sheets)' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll() {
    return this.sessionsOrdersService.findAll();
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

    return this.sessionsOrdersService.uploadAndParse(file.buffer);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all sessions/orders records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll() {
    return this.sessionsOrdersService.deleteAll();
  }
}
