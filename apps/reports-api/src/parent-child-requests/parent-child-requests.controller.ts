import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { JSendSuccess } from '@repo/reports/common';
import { ParentChildRequestsService } from '@parent-child-requests/parent-child-requests.service';
import { ExcelParserService } from '@parent-child-requests/infrastructure/services/excel-parser.service';
import type { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

@ApiTags('parent-child-requests')
@Controller('parent-child-requests')
export class ParentChildRequestsController {
  constructor(
    private readonly parentChildRequestsService: ParentChildRequestsService,
    private readonly excelParserService: ExcelParserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all parent-child request relationships' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'List of parent-child relationships',
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<JSendSuccess<{ data: ParentChildRequest[]; total: number }>> {
    const result = await this.parentChildRequestsService.findAll(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
    return {
      status: 'success',
      data: result,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics about parent-child relationships' })
  @ApiResponse({
    status: 200,
    description:
      'Statistics including total records, unique parents, and top parents',
  })
  async getStats(): Promise<JSendSuccess<{
    totalRecords: number;
    uniqueParents: number;
    topParents: Array<{ parentId: string; childCount: number; link: string | null }>;
  }>> {
    const stats = await this.parentChildRequestsService.getStats();
    return {
      status: 'success',
      data: stats,
    };
  }

  @Get('parent/:id')
  @ApiOperation({ summary: 'Get all child requests for a specific parent' })
  @ApiParam({ name: 'id', type: String, description: 'Parent request ID' })
  @ApiResponse({ status: 200, description: 'List of child requests' })
  async findChildrenByParent(@Param('id') parentId: string): Promise<JSendSuccess<ParentChildRequest[]>> {
    const children = await this.parentChildRequestsService.findChildrenByParent(parentId);
    return {
      status: 'success',
      data: children,
    };
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload and import parent-child requests from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx or .xls)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded and data imported successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        imported: { type: 'number' },
        skipped: { type: 'number' },
        total: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid file or format' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any): Promise<JSendSuccess<{
    message: string;
    imported: number;
    skipped: number;
    total: number;
  }>> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
      );
    }

    try {
      // Parse Excel file using the service
      const data = this.excelParserService.parseExcelFile(file.buffer);

      // Import data
      const result = await this.parentChildRequestsService.importFromExcel(data);

      return {
        status: 'success',
        data: {
          message: 'File processed successfully',
          imported: result.imported,
          skipped: result.skipped,
          total: data.length,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to process file: ${(error as Error).message}`,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all parent-child request relationships' })
  @ApiResponse({
    status: 200,
    description: 'All parent-child relationships deleted successfully',
  })
  async deleteAll(): Promise<JSendSuccess<{ deleted: boolean; message: string }>> {
    await this.parentChildRequestsService.deleteAll();
    return {
      status: 'success',
      data: {
        deleted: true,
        message: 'All parent-child relationships deleted successfully',
      },
    };
  }
}
