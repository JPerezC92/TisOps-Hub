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
  ApiQuery,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  pcReqGetAllResponseSchema,
  pcReqStatsResponseSchema,
  pcReqUploadResultSchema,
  pcReqDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { GetAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/get-all-parent-child-requests.use-case';
import { GetChildrenByParentUseCase } from '@parent-child-requests/application/use-cases/get-children-by-parent.use-case';
import { GetStatsUseCase } from '@parent-child-requests/application/use-cases/get-stats.use-case';
import { CreateManyParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/create-many.use-case';
import { DeleteAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/delete-all.use-case';
import { ExcelParserService } from '@parent-child-requests/infrastructure/services/excel-parser.service';

// JSend success DTOs
class JSendPcReqGetAllDto extends createZodDto(jsendSuccess(pcReqGetAllResponseSchema)) {}
class JSendPcReqStatsDto extends createZodDto(jsendSuccess(pcReqStatsResponseSchema)) {}
class JSendPcReqUploadResultDto extends createZodDto(jsendSuccess(pcReqUploadResultSchema)) {}
class JSendPcReqDeleteResultDto extends createZodDto(jsendSuccess(pcReqDeleteResultSchema)) {}

@ApiTags('parent-child-requests')
@Controller('parent-child-requests')
export class ParentChildRequestsController {
  constructor(
    private readonly getAllUseCase: GetAllParentChildRequestsUseCase,
    private readonly getChildrenByParentUseCase: GetChildrenByParentUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly createManyUseCase: CreateManyParentChildRequestsUseCase,
    private readonly deleteAllUseCase: DeleteAllParentChildRequestsUseCase,
    private readonly excelParserService: ExcelParserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all parent-child request relationships' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  @ZodResponse({ status: 200, description: 'List of parent-child relationships', type: JSendPcReqGetAllDto })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const data = await this.getAllUseCase.execute(
      limit ? Number(limit) : undefined,
      offset ? Number(offset) : undefined,
    );
    return { status: 'success' as const, data };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get statistics about parent-child relationships' })
  @ZodResponse({ status: 200, description: 'Statistics including total records, unique parents, and top parents', type: JSendPcReqStatsDto })
  async getStats() {
    const data = await this.getStatsUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('parent/:id')
  @ApiOperation({ summary: 'Get all child requests for a specific parent' })
  @ApiParam({ name: 'id', type: String, description: 'Parent request ID' })
  @ApiResponse({ status: 200, description: 'List of child requests' })
  async findChildrenByParent(@Param('id') parentId: string) {
    const data = await this.getChildrenByParentUseCase.execute(parentId);
    return { status: 'success' as const, data };
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
  @ZodResponse({ status: 201, description: 'File uploaded and data imported successfully', type: JSendPcReqUploadResultDto })
  @ApiResponse({ status: 400, description: 'Invalid file or format' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const validMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Please upload an Excel file (.xlsx or .xls)',
      );
    }

    try {
      const data = this.excelParserService.parseExcelFile(file.buffer);
      const result = await this.createManyUseCase.execute(data);

      return {
        status: 'success' as const,
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
  @ZodResponse({ status: 200, description: 'All parent-child relationships deleted successfully', type: JSendPcReqDeleteResultDto })
  async deleteAll() {
    await this.deleteAllUseCase.execute();
    return {
      status: 'success' as const,
      data: {
        deleted: true,
        message: 'All parent-child relationships deleted successfully',
      },
    };
  }
}
