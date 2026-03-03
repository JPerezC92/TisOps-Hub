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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { JSendSuccess } from '@repo/reports/common';
import type { RequestCategorization, CategorySummary } from '@repo/reports';
import { RequestCategorizationService } from './request-categorization.service';

interface RequestCategorizationWithInfo extends RequestCategorization {
  additionalInformation: string[];
  tagCategorizacion: string[];
}

interface UploadResult {
  message: string;
  recordsCreated: number;
  recordsUpdated: number;
  totalRecords: number;
}

interface RequestIdEntry {
  requestId: string;
  requestIdLink?: string;
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('request-categorization')
@Controller('request-categorization')
export class RequestCategorizationController {
  constructor(
    private readonly requestCategorizationService: RequestCategorizationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all request categorization records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll(): Promise<JSendSuccess<RequestCategorizationWithInfo[]>> {
    const result = await this.requestCategorizationService.findAll();
    return { status: 'success', data: result };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get category summary with counts' })
  @ApiResponse({ status: 200, description: 'Returns category summary' })
  async getCategorySummary(): Promise<JSendSuccess<CategorySummary[]>> {
    const result = await this.requestCategorizationService.getCategorySummary();
    return { status: 'success', data: result };
  }

  @Get('request-ids-by-categorization')
  @ApiOperation({
    summary: 'Get request IDs that share a linked request and categorization',
  })
  @ApiQuery({
    name: 'linkedRequestId',
    required: true,
    description: 'The linked request ID to filter by',
  })
  @ApiQuery({
    name: 'categorizacion',
    required: true,
    description: 'The categorization value to filter by',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of request IDs with their links',
    schema: {
      type: 'object',
      properties: {
        requestIds: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              requestId: { type: 'string' },
              requestIdLink: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Missing required query parameters' })
  async getRequestIdsByCategorizacion(
    @Query('linkedRequestId') linkedRequestId: string,
    @Query('categorizacion') categorizacion: string,
  ) {
    if (!linkedRequestId || !categorizacion) {
      throw new HttpException(
        'linkedRequestId and categorizacion query parameters are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.requestCategorizationService.getRequestIdsByCategorizacion(
      linkedRequestId,
      categorizacion,
    );
    return { status: 'success' as const, data: result } satisfies JSendSuccess<{ requestIds: RequestIdEntry[] }>;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse Excel file (REP001 PARA ETIQUETAR format)' })
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
  async uploadFile(@UploadedFile() file: MulterFile | undefined) {
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
      const result = await this.requestCategorizationService.uploadAndParse(file.buffer);
      return { status: 'success' as const, data: result } satisfies JSendSuccess<UploadResult>;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to parse file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all request categorization records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll(): Promise<JSendSuccess<{ message: string }>> {
    const result = await this.requestCategorizationService.deleteAll();
    return { status: 'success', data: result };
  }
}
