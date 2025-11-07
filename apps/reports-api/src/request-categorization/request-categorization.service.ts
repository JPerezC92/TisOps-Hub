import { Injectable } from '@nestjs/common';
import { GetAllRequestCategorizationsUseCase } from './application/use-cases/get-all-request-categorizations.use-case';
import { GetAllRequestCategorizationsWithAdditionalInfoUseCase } from './application/use-cases/get-all-with-additional-info.use-case';
import { DeleteAllRequestCategorizationsUseCase } from './application/use-cases/delete-all-request-categorizations.use-case';
import { UpsertManyRequestCategorizationsUseCase } from './application/use-cases/upsert-many-request-categorizations.use-case';
import { GetCategorySummaryUseCase } from './application/use-cases/get-category-summary.use-case';
import { GetRequestIdsByCategorizacionUseCase } from './application/use-cases/get-request-ids-by-categorizacion.use-case';
import { ExcelParserService } from './infrastructure/services/excel-parser.service';

@Injectable()
export class RequestCategorizationService {
  constructor(
    private readonly getAllUseCase: GetAllRequestCategorizationsUseCase,
    private readonly getAllWithAdditionalInfoUseCase: GetAllRequestCategorizationsWithAdditionalInfoUseCase,
    private readonly deleteAllUseCase: DeleteAllRequestCategorizationsUseCase,
    private readonly upsertManyUseCase: UpsertManyRequestCategorizationsUseCase,
    private readonly getCategorySummaryUseCase: GetCategorySummaryUseCase,
    private readonly getRequestIdsByCategorizacionUseCase: GetRequestIdsByCategorizacionUseCase,
    private readonly excelParser: ExcelParserService,
  ) {}

  async findAll() {
    return this.getAllWithAdditionalInfoUseCase.execute();
  }

  async uploadAndParse(buffer: Buffer) {
    const entities = this.excelParser.parseExcelFile(buffer);
    
    // UPSERT: Update existing records or create new ones (no deletion)
    const result = await this.upsertManyUseCase.execute(entities);
    
    return {
      message: 'File uploaded and parsed successfully',
      recordsCreated: result.created,
      recordsUpdated: result.updated,
      totalRecords: result.created + result.updated,
    };
  }

  async getCategorySummary() {
    return this.getCategorySummaryUseCase.execute();
  }

  async getRequestIdsByCategorizacion(
    linkedRequestId: string,
    categorizacion: string,
  ) {
    const requestIds =
      await this.getRequestIdsByCategorizacionUseCase.execute(
        linkedRequestId,
        categorizacion,
      );
    return { requestIds };
  }

  async deleteAll() {
    await this.deleteAllUseCase.execute();
    return { message: 'All records deleted successfully' };
  }
}
