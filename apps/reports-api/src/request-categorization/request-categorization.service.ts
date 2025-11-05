import { Injectable } from '@nestjs/common';
import { GetAllRequestCategorizationsUseCase } from './application/use-cases/get-all-request-categorizations.use-case';
import { DeleteAllRequestCategorizationsUseCase } from './application/use-cases/delete-all-request-categorizations.use-case';
import { CreateManyRequestCategorizationsUseCase } from './application/use-cases/create-many-request-categorizations.use-case';
import { GetCategorySummaryUseCase } from './application/use-cases/get-category-summary.use-case';
import { ExcelParserService } from './infrastructure/services/excel-parser.service';

@Injectable()
export class RequestCategorizationService {
  constructor(
    private readonly getAllUseCase: GetAllRequestCategorizationsUseCase,
    private readonly deleteAllUseCase: DeleteAllRequestCategorizationsUseCase,
    private readonly createManyUseCase: CreateManyRequestCategorizationsUseCase,
    private readonly getCategorySummaryUseCase: GetCategorySummaryUseCase,
    private readonly excelParser: ExcelParserService,
  ) {}

  async findAll() {
    const entities = await this.getAllUseCase.execute();
    return entities.map((entity) => ({
      id: entity.getId(),
      category: entity.getCategory(),
      technician: entity.getTechnician(),
      requestId: entity.getRequestId(),
      requestIdLink: entity.getRequestIdLink(),
      createdTime: entity.getCreatedTime(),
      modulo: entity.getModulo(),
      subject: entity.getSubject(),
      problemId: entity.getProblemId(),
      linkedRequestId: entity.getLinkedRequestId(),
      linkedRequestIdLink: entity.getLinkedRequestIdLink(),
    }));
  }

  async uploadAndParse(buffer: Buffer) {
    const entities = this.excelParser.parseExcelFile(buffer);
    
    await this.deleteAllUseCase.execute();
    
    const created = await this.createManyUseCase.execute(entities);
    
    return {
      message: 'File uploaded and parsed successfully',
      recordsCreated: created.length,
    };
  }

  async getCategorySummary() {
    return this.getCategorySummaryUseCase.execute();
  }

  async deleteAll() {
    await this.deleteAllUseCase.execute();
    return { message: 'All records deleted successfully' };
  }
}
