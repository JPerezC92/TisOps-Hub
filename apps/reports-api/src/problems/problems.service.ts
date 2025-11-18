import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { GetAllProblemsUseCase } from './application/use-cases/get-all-problems.use-case';
import { DeleteAllProblemsUseCase } from './application/use-cases/delete-all-problems.use-case';
import { UploadAndParseProblemsUseCase } from './application/use-cases/upload-and-parse-problems.use-case';
import { ProblemsExcelParser } from './infrastructure/parsers/problems-excel.parser';

@Injectable()
export class ProblemsService {
  constructor(
    @Inject(GetAllProblemsUseCase)
    private readonly getAllUseCase: GetAllProblemsUseCase,
    @Inject(DeleteAllProblemsUseCase)
    private readonly deleteAllUseCase: DeleteAllProblemsUseCase,
    @Inject(UploadAndParseProblemsUseCase)
    private readonly uploadAndParseUseCase: UploadAndParseProblemsUseCase,
    private readonly excelParser: ProblemsExcelParser,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async deleteAll() {
    return this.deleteAllUseCase.execute();
  }

  async uploadAndParse(buffer: Buffer) {
    try {
      // Infrastructure: Parse Excel
      const records = this.excelParser.parse(buffer);

      // Application: Execute business logic
      return await this.uploadAndParseUseCase.execute(records);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
