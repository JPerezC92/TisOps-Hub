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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import {
  probGetAllResponseSchema,
  probUploadResultSchema,
  probDeleteResultSchema,
} from '@repo/reports';
import { jsendSuccess } from '@repo/reports/common';
import { GetAllProblemsUseCase } from '@problems/application/use-cases/get-all-problems.use-case';
import { DeleteAllProblemsUseCase } from '@problems/application/use-cases/delete-all-problems.use-case';
import { UploadAndParseProblemsUseCase } from '@problems/application/use-cases/upload-and-parse-problems.use-case';
import { ProblemsExcelParser } from '@problems/infrastructure/parsers/problems-excel.parser';

// JSend success DTOs
class JSendProbGetAllDto extends createZodDto(jsendSuccess(probGetAllResponseSchema)) {}
class JSendProbUploadResultDto extends createZodDto(jsendSuccess(probUploadResultSchema)) {}
class JSendProbDeleteResultDto extends createZodDto(jsendSuccess(probDeleteResultSchema)) {}

@ApiTags('problems')
@Controller('problems')
export class ProblemsController {
  constructor(
    private readonly getAllProblemsUseCase: GetAllProblemsUseCase,
    private readonly deleteAllProblemsUseCase: DeleteAllProblemsUseCase,
    private readonly uploadAndParseProblemsUseCase: UploadAndParseProblemsUseCase,
    private readonly excelParser: ProblemsExcelParser,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all problem records' })
  @ZodResponse({ status: 200, description: 'Returns all records', type: JSendProbGetAllDto })
  async findAll() {
    const data = await this.getAllProblemsUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and parse XD PROBLEMAS NUEVOS.xlsx file' })
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
  @ZodResponse({ status: 201, description: 'File uploaded and parsed successfully', type: JSendProbUploadResultDto })
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
      const data = await this.uploadAndParseProblemsUseCase.execute(records);
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
  @ApiOperation({ summary: 'Delete all problem records' })
  @ZodResponse({ status: 200, description: 'All records deleted', type: JSendProbDeleteResultDto })
  async deleteAll() {
    const data = await this.deleteAllProblemsUseCase.execute();
    return { status: 'success' as const, data };
  }
}
