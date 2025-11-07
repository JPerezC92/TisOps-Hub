import { Module } from '@nestjs/common';
import { REQUEST_CATEGORIZATION_REPOSITORY } from './domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationRepository } from './infrastructure/repositories/request-categorization.repository';
import { GetAllRequestCategorizationsUseCase } from './application/use-cases/get-all-request-categorizations.use-case';
import { GetAllRequestCategorizationsWithAdditionalInfoUseCase } from './application/use-cases/get-all-with-additional-info.use-case';
import { DeleteAllRequestCategorizationsUseCase } from './application/use-cases/delete-all-request-categorizations.use-case';
import { UpsertManyRequestCategorizationsUseCase } from './application/use-cases/upsert-many-request-categorizations.use-case';
import { GetCategorySummaryUseCase } from './application/use-cases/get-category-summary.use-case';
import { GetRequestIdsByCategorizacionUseCase } from './application/use-cases/get-request-ids-by-categorizacion.use-case';
import { ExcelParserService } from './infrastructure/services/excel-parser.service';
import { RequestCategorizationService } from './request-categorization.service';
import { RequestCategorizationController } from './request-categorization.controller';
import { DATABASE_CONNECTION } from '@repo/database';

@Module({
  controllers: [RequestCategorizationController],
  providers: [
    {
      provide: REQUEST_CATEGORIZATION_REPOSITORY,
      useFactory: (db) => new RequestCategorizationRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllRequestCategorizationsUseCase,
      useFactory: (repository) =>
        new GetAllRequestCategorizationsUseCase(repository),
      inject: [REQUEST_CATEGORIZATION_REPOSITORY],
    },
    {
      provide: GetAllRequestCategorizationsWithAdditionalInfoUseCase,
      useFactory: (requestCategorizationRepository) =>
        new GetAllRequestCategorizationsWithAdditionalInfoUseCase(
          requestCategorizationRepository,
        ),
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
    RequestCategorizationService,
  ],
})
export class RequestCategorizationModule {}
