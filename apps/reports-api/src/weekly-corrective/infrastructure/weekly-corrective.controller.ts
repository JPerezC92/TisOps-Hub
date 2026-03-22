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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  wkCorrGetAllResponseSchema,
  wkCorrUploadResultSchema,
  wkCorrDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { GetAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/get-all-weekly-correctives.use-case';
import { DeleteAllWeeklyCorrectivesUseCase } from '@weekly-corrective/application/use-cases/delete-all-weekly-correctives.use-case';
import { UploadAndParseWeeklyCorrectiveUseCase } from '@weekly-corrective/application/use-cases/upload-and-parse-weekly-corrective.use-case';
import { GetL3TicketsByStatusUseCase } from '@weekly-corrective/application/use-cases/get-l3-tickets-by-status.use-case';
import { SyncSubjectTranslationsUseCase } from '@monthly-report/application/use-cases/sync-subject-translations.use-case';
import { WeeklyCorrectiveExcelParser } from '@weekly-corrective/infrastructure/parsers/weekly-corrective-excel.parser';

// JSend success DTOs
class JSendWkCorrGetAllDto extends createZodDto(jsendSuccess(wkCorrGetAllResponseSchema)) {}
class JSendWkCorrUploadResultDto extends createZodDto(jsendSuccess(wkCorrUploadResultSchema)) {}
class JSendWkCorrDeleteResultDto extends createZodDto(jsendSuccess(wkCorrDeleteResultSchema)) {}

@ApiTags('weekly-corrective')
@Controller('weekly-corrective')
export class WeeklyCorrectiveController {
  constructor(
    private readonly getAllUseCase: GetAllWeeklyCorrectivesUseCase,
    private readonly deleteAllUseCase: DeleteAllWeeklyCorrectivesUseCase,
    private readonly uploadAndParseUseCase: UploadAndParseWeeklyCorrectiveUseCase,
    private readonly getL3TicketsByStatusUseCase: GetL3TicketsByStatusUseCase,
    private readonly syncSubjectTranslationsUseCase: SyncSubjectTranslationsUseCase,
    private readonly excelParser: WeeklyCorrectiveExcelParser,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all weekly corrective records' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendWkCorrGetAllDto })
  async findAll() {
    const data = await this.getAllUseCase.execute();
    return { status: 'success' as const, data };
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
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendWkCorrUploadResultDto })
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

      // Sync subject translations for SB/FFVV apps (non-blocking)
      const translatableRecords = records.map((r) => ({
        requestId: r.requestId,
        aplicativos: r.aplicativos,
        subject: r.subject,
      }));
      this.syncSubjectTranslationsUseCase.execute(translatableRecords).catch((err) => {
        console.error('Subject translation sync failed:', err);
      });

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
  @ApiOperation({ summary: 'Delete all weekly corrective records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendWkCorrDeleteResultDto })
  async deleteAll() {
    const data = await this.deleteAllUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get('l3-tickets-by-status')
  @ApiOperation({ summary: 'Get L3 ticket counts by status grouped by application' })
  @ApiResponse({ status: 200, description: 'Returns L3 tickets grouped by status and application' })
  async getL3TicketsByStatus(
    @Query('app') app?: string,
    @Query('month') month?: string,
  ) {
    const data = await this.getL3TicketsByStatusUseCase.execute(app, month);
    return { status: 'success' as const, data };
  }
}
