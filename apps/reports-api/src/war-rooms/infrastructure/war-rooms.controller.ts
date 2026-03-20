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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  warRoomGetAllResponseSchema,
  warRoomUploadResultSchema,
  warRoomDeleteResultSchema,
  warRoomAnalyticsResponseSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { GetAllWarRoomsUseCase } from '@war-rooms/application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from '@war-rooms/application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import { WarRoomsExcelParser } from '@war-rooms/infrastructure/parsers/war-rooms-excel.parser';

// JSend success DTOs
class JSendWarRoomGetAllDto extends createZodDto(jsendSuccess(warRoomGetAllResponseSchema)) {}
class JSendWarRoomUploadResultDto extends createZodDto(jsendSuccess(warRoomUploadResultSchema)) {}
class JSendWarRoomDeleteResultDto extends createZodDto(jsendSuccess(warRoomDeleteResultSchema)) {}
class JSendWarRoomAnalyticsDto extends createZodDto(jsendSuccess(warRoomAnalyticsResponseSchema)) {}

@ApiTags('war-rooms')
@Controller('war-rooms')
export class WarRoomsController {
  constructor(
    private readonly getAllUseCase: GetAllWarRoomsUseCase,
    private readonly deleteAllUseCase: DeleteAllWarRoomsUseCase,
    private readonly uploadAndParseUseCase: UploadAndParseWarRoomsUseCase,
    private readonly excelParser: WarRoomsExcelParser,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all war rooms records' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendWarRoomGetAllDto })
  async findAll() {
    const data = await this.getAllUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get filtered war rooms records for analytics dashboard' })
  @ZodResponse({ status: 200, description: 'Returns filtered records', type: JSendWarRoomAnalyticsDto })
  async getAnalytics(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getAllUseCase.executeWithFilters(app, month);
    return { status: 'success' as const, data };
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
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendWarRoomUploadResultDto })
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
      const records = this.excelParser.parse(file.buffer);
      const data = await this.uploadAndParseUseCase.execute(records);
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
  @ApiOperation({ summary: 'Delete all war rooms records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendWarRoomDeleteResultDto })
  async deleteAll() {
    const data = await this.deleteAllUseCase.execute();
    return { status: 'success' as const, data };
  }
}
