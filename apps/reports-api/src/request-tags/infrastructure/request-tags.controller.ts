import {
  Controller,
  Get,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  HttpCode,
  Query,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import * as XLSX from 'xlsx';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  requestTagListResponseSchema,
  requestTagUploadResultSchema,
  requestTagDeleteResultSchema,
  requestTagByAdditionalInfoResponseSchema,
  requestTagMissingIdsResponseSchema,
  requestTagSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { DomainError } from '@shared/domain/errors/domain.error';
import { GetAllRequestTagsUseCase } from '@request-tags/application/use-cases/get-all-request-tags.use-case';
import { DeleteAllRequestTagsUseCase } from '@request-tags/application/use-cases/delete-all-request-tags.use-case';
import { ImportRequestTagsUseCase } from '@request-tags/application/use-cases/import-request-tags.use-case';
import { CreateRequestTagUseCase } from '@request-tags/application/use-cases/create-request-tag.use-case';
import { GetRequestIdsByAdditionalInfoUseCase } from '@request-tags/application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from '@request-tags/application/use-cases/get-missing-ids-by-linked-request.use-case';
import { CreateRequestTagDto } from '@request-tags/application/dtos/create-request-tag.dto';

// JSend success DTOs
class JSendRequestTagListDto extends createZodDto(jsendSuccess(requestTagListResponseSchema)) {}
class JSendRequestTagDto extends createZodDto(jsendSuccess(requestTagSchema)) {}
class JSendRequestTagUploadResultDto extends createZodDto(jsendSuccess(requestTagUploadResultSchema)) {}
class JSendRequestTagDeleteResultDto extends createZodDto(jsendSuccess(requestTagDeleteResultSchema)) {}
class JSendRequestTagByAdditionalInfoDto extends createZodDto(jsendSuccess(requestTagByAdditionalInfoResponseSchema)) {}
class JSendRequestTagMissingIdsDto extends createZodDto(jsendSuccess(requestTagMissingIdsResponseSchema)) {}

@ApiTags('request-tags')
@Controller('request-tags')
export class RequestTagsController {
  constructor(
    private readonly getAllUseCase: GetAllRequestTagsUseCase,
    private readonly deleteAllUseCase: DeleteAllRequestTagsUseCase,
    private readonly importUseCase: ImportRequestTagsUseCase,
    private readonly createUseCase: CreateRequestTagUseCase,
    private readonly getRequestIdsByAdditionalInfoUseCase: GetRequestIdsByAdditionalInfoUseCase,
    private readonly getMissingIdsByLinkedRequestUseCase: GetMissingIdsByLinkedRequestUseCase,
  ) {}

  private decodeHTMLEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' ',
    };
    return text.replace(/&[a-z]+;|&#\d+;/gi, (match) => entities[match] || match);
  }

  private extractHyperlink(
    worksheet: XLSX.WorkSheet,
    rowIndex: number,
    colIndex: number,
  ): string | undefined {
    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    const cell = worksheet[cellAddress];

    if (cell && cell.l && cell.l.Target) {
      return this.decodeHTMLEntities(cell.l.Target);
    }

    return undefined;
  }

  @Get()
  @ApiOperation({ summary: 'Get all request tag records' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendRequestTagListDto })
  async findAll() {
    const tags = await this.getAllUseCase.execute();
    return {
      status: 'success' as const,
      data: {
        tags,
        total: tags.length,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new request tag' })
  @ZodResponse({ status: 201, description: 'Request tag created successfully', type: JSendRequestTagDto })
  @ApiResponse({ status: 409, description: 'Request tag already exists' })
  async create(@Body() data: CreateRequestTagDto) {
    const result = await this.createUseCase.execute(data);

    if (DomainError.isDomainError(result)) {
      throw result;
    }

    return {
      status: 'success' as const,
      data: result,
    };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse request tags Excel file (REP01 XD TAG 2025 format)' })
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
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendRequestTagUploadResultDto })
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
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        throw new HttpException('Excel file is empty', HttpStatus.BAD_REQUEST);
      }

      const records = data.map((row: any, index: number) => {
        const rowIndex = index + 1;

        const requestIdLink = this.extractHyperlink(worksheet, rowIndex, 2);
        const linkedRequestIdLink = this.extractHyperlink(worksheet, rowIndex, 5);

        return {
          createdTime: String(row['Created Time'] || ''),
          requestId: String(row['Request ID'] || ''),
          requestIdLink: requestIdLink || undefined,
          informacionAdicional: String(row['Información Adicional'] || ''),
          modulo: String(row['Modulo.'] || ''),
          problemId: String(row['Problem ID'] || ''),
          linkedRequestId: String(row['Linked Request Id'] || ''),
          linkedRequestIdLink: linkedRequestIdLink || undefined,
          jira: String(row['Jira'] || ''),
          categorizacion: String(row['Categorización'] || ''),
          technician: String(row['Technician'] || ''),
        };
      });

      const invalidRecords = records.filter(
        (record) => !record.requestId || !record.createdTime,
      );

      if (invalidRecords.length > 0) {
        throw new HttpException(
          'Some records are missing required fields (Request ID, Created Time)',
          HttpStatus.BAD_REQUEST,
        );
      }

      const result = await this.importUseCase.execute(records);

      return {
        status: 'success' as const,
        data: {
          imported: result.imported,
          skipped: result.skipped,
          total: records.length,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to parse file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all request tag records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendRequestTagDeleteResultDto })
  async deleteAll() {
    const result = await this.deleteAllUseCase.execute();
    return {
      status: 'success' as const,
      data: {
        deleted: result.deleted,
      },
    };
  }

  @Get('by-additional-info')
  @ApiOperation({ summary: 'Get Request IDs by Additional Information value' })
  @ApiQuery({
    name: 'info',
    required: true,
    description: 'The informacion_adicional value to search for',
    type: String,
  })
  @ApiQuery({
    name: 'linkedRequestId',
    required: true,
    description: 'The linkedRequestId to filter results by',
    type: String,
  })
  @ZodResponse({ status: 200, description: 'Returns array of distinct Request IDs', type: JSendRequestTagByAdditionalInfoDto })
  @ApiResponse({ status: 400, description: 'Query parameters "info" and "linkedRequestId" are required' })
  async getRequestIdsByAdditionalInfo(
    @Query('info') info: string,
    @Query('linkedRequestId') linkedRequestId: string,
  ) {
    if (!info) {
      throw new HttpException(
        'Query parameter "info" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!linkedRequestId) {
      throw new HttpException(
        'Query parameter "linkedRequestId" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const requestIds = await this.getRequestIdsByAdditionalInfoUseCase.execute(info, linkedRequestId);
    return {
      status: 'success' as const,
      data: { requestIds },
    };
  }

  @Get('missing-ids')
  @ApiOperation({
    summary: 'Get Request IDs that are missing from request_tags',
    description: 'Returns Request IDs that exist in parent_child_requests but NOT in request_tags for a given linkedRequestId',
  })
  @ApiQuery({
    name: 'linkedRequestId',
    required: true,
    description: 'The linked request ID to search for missing IDs',
    type: String,
  })
  @ZodResponse({ status: 200, description: 'Returns array of missing Request IDs with their links', type: JSendRequestTagMissingIdsDto })
  @ApiResponse({ status: 400, description: 'Query parameter "linkedRequestId" is required' })
  async getMissingIds(@Query('linkedRequestId') linkedRequestId: string) {
    if (!linkedRequestId) {
      throw new HttpException(
        'Query parameter "linkedRequestId" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const missingIds = await this.getMissingIdsByLinkedRequestUseCase.execute(linkedRequestId);
    return {
      status: 'success' as const,
      data: { missingIds },
    };
  }
}
