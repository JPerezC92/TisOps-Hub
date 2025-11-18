import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { GetAllWeeklyCorrectivesUseCase } from './application/use-cases/get-all-weekly-correctives.use-case';
import { DeleteAllWeeklyCorrectivesUseCase } from './application/use-cases/delete-all-weekly-correctives.use-case';
import { UploadAndParseWeeklyCorrectiveUseCase } from './application/use-cases/upload-and-parse-weekly-corrective.use-case';
import { WeeklyCorrectiveExcelParser } from './infrastructure/parsers/weekly-corrective-excel.parser';

@Injectable()
export class WeeklyCorrectiveService {
  constructor(
    @Inject(GetAllWeeklyCorrectivesUseCase)
    private readonly getAllUseCase: GetAllWeeklyCorrectivesUseCase,
    @Inject(DeleteAllWeeklyCorrectivesUseCase)
    private readonly deleteAllUseCase: DeleteAllWeeklyCorrectivesUseCase,
    @Inject(UploadAndParseWeeklyCorrectiveUseCase)
    private readonly uploadAndParseUseCase: UploadAndParseWeeklyCorrectiveUseCase,
    private readonly excelParser: WeeklyCorrectiveExcelParser,
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
