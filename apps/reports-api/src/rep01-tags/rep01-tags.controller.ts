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
import { Rep01TagsService } from './rep01-tags.service';
import { GetRequestIdsByAdditionalInfoUseCase } from './application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from './application/use-cases/get-missing-ids-by-linked-request.use-case';

@ApiTags('rep01-tags')
@Controller('rep01-tags')
export class Rep01TagsController {
  constructor(
    private readonly rep01TagsService: Rep01TagsService,
    private readonly getRequestIdsByAdditionalInfoUseCase: GetRequestIdsByAdditionalInfoUseCase,
    private readonly getMissingIdsByLinkedRequestUseCase: GetMissingIdsByLinkedRequestUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all REP01 tag records' })
  @ApiResponse({ status: 200, description: 'Returns all records' })
  async findAll() {
    return this.rep01TagsService.findAll();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse Excel file (REP01 XD TAG format)' })
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

    return this.rep01TagsService.uploadAndParse(file.buffer);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all REP01 tag records' })
  @ApiResponse({ status: 200, description: 'All records deleted' })
  async deleteAll() {
    return this.rep01TagsService.deleteAll();
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
  @ApiResponse({
    status: 200,
    description: 'Returns array of distinct Request IDs',
    type: [String],
  })
  @ApiResponse({
    status: 400,
    description: 'Query parameters "info" and "linkedRequestId" are required',
  })
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

    return this.getRequestIdsByAdditionalInfoUseCase.execute(info, linkedRequestId);
  }

  @Get('missing-ids')
  @ApiOperation({
    summary: 'Get Request IDs that are missing from rep01_tags',
    description: 'Returns Request IDs that exist in parent_child_requests but NOT in rep01_tags for a given linkedRequestId'
  })
  @ApiQuery({
    name: 'linkedRequestId',
    required: true,
    description: 'The linked request ID to search for missing IDs',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns array of missing Request IDs with their links',
    schema: {
      type: 'object',
      properties: {
        missingIds: {
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
  @ApiResponse({
    status: 400,
    description: 'Query parameter "linkedRequestId" is required',
  })
  async getMissingIds(@Query('linkedRequestId') linkedRequestId: string) {
    if (!linkedRequestId) {
      throw new HttpException(
        'Query parameter "linkedRequestId" is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const missingIds = await this.getMissingIdsByLinkedRequestUseCase.execute(linkedRequestId);
    return { missingIds };
  }
}
