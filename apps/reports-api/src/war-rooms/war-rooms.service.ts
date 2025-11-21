import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { GetAllWarRoomsUseCase } from './application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from './application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from './application/use-cases/upload-and-parse-war-rooms.use-case';
import { WarRoomsExcelParser } from './infrastructure/parsers/war-rooms-excel.parser';

@Injectable()
export class WarRoomsService {
  constructor(
    @Inject(GetAllWarRoomsUseCase)
    private readonly getAllUseCase: GetAllWarRoomsUseCase,
    @Inject(DeleteAllWarRoomsUseCase)
    private readonly deleteAllUseCase: DeleteAllWarRoomsUseCase,
    @Inject(UploadAndParseWarRoomsUseCase)
    private readonly uploadAndParseUseCase: UploadAndParseWarRoomsUseCase,
    private readonly excelParser: WarRoomsExcelParser,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async getAnalytics(app?: string, month?: string) {
    return this.getAllUseCase.executeWithFilters(app, month);
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
