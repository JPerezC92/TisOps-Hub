import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { GetAllSessionsOrdersUseCase } from './application/use-cases/get-all-sessions-orders.use-case';
import { DeleteAllSessionsOrdersUseCase } from './application/use-cases/delete-all-sessions-orders.use-case';
import { UploadAndParseSessionsOrdersUseCase } from './application/use-cases/upload-and-parse-sessions-orders.use-case';
import { SessionsOrdersExcelParser } from './infrastructure/parsers/sessions-orders-excel.parser';

@Injectable()
export class SessionsOrdersService {
  constructor(
    @Inject(GetAllSessionsOrdersUseCase)
    private readonly getAllUseCase: GetAllSessionsOrdersUseCase,
    @Inject(DeleteAllSessionsOrdersUseCase)
    private readonly deleteAllUseCase: DeleteAllSessionsOrdersUseCase,
    @Inject(UploadAndParseSessionsOrdersUseCase)
    private readonly uploadAndParseUseCase: UploadAndParseSessionsOrdersUseCase,
    private readonly excelParser: SessionsOrdersExcelParser,
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
      const { mainRecords, releaseRecords } = this.excelParser.parse(buffer);

      // Application: Execute business logic
      return await this.uploadAndParseUseCase.execute(mainRecords, releaseRecords);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to process file: ${message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
