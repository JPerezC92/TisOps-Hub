import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { REQUEST_CATEGORIZATION_REPOSITORY } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationRepository } from '@request-categorization/infrastructure/repositories/request-categorization.repository';
import { GetAllRequestCategorizationsWithAdditionalInfoUseCase } from '@request-categorization/application/use-cases/get-all-with-additional-info.use-case';
import { DeleteAllRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/delete-all-request-categorizations.use-case';
import { UpsertManyRequestCategorizationsUseCase } from '@request-categorization/application/use-cases/upsert-many-request-categorizations.use-case';
import { GetCategorySummaryUseCase } from '@request-categorization/application/use-cases/get-category-summary.use-case';
import { GetRequestIdsByCategorizacionUseCase } from '@request-categorization/application/use-cases/get-request-ids-by-categorizacion.use-case';
import { ExcelParserService } from '@request-categorization/infrastructure/services/excel-parser.service';
import { RequestCategorizationController } from '@request-categorization/infrastructure/controller';

@Module({
  controllers: [RequestCategorizationController],
  providers: [
    {
      provide: REQUEST_CATEGORIZATION_REPOSITORY,
      useFactory: (db) => new RequestCategorizationRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllRequestCategorizationsWithAdditionalInfoUseCase,
      useFactory: (repository) =>
        new GetAllRequestCategorizationsWithAdditionalInfoUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    {
      provide: DeleteAllRequestCategorizationsUseCase,
      useFactory: (repository) =>
        new DeleteAllRequestCategorizationsUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    {
      provide: UpsertManyRequestCategorizationsUseCase,
      useFactory: (repository) =>
        new UpsertManyRequestCategorizationsUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    {
      provide: GetCategorySummaryUseCase,
      useFactory: (repository) => new GetCategorySummaryUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    {
      provide: GetRequestIdsByCategorizacionUseCase,
      useFactory: (repository) =>
        new GetRequestIdsByCategorizacionUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    ExcelParserService,
  ],
})
export class RequestCategorizationModule {}
