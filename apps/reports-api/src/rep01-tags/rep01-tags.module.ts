import { Module } from '@nestjs/common';
import { Rep01TagsController } from './rep01-tags.controller';
import { Rep01TagsService } from './rep01-tags.service';
import { GetAllRep01TagsUseCase } from './application/use-cases/get-all-rep01-tags.use-case';
import { CreateRep01TagUseCase } from './application/use-cases/create-rep01-tag.use-case';
import { DeleteAllRep01TagsUseCase } from './application/use-cases/delete-all-rep01-tags.use-case';
import { ImportRep01TagsUseCase } from './application/use-cases/import-rep01-tags.use-case';
import { GetRequestIdsByAdditionalInfoUseCase } from './application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from './application/use-cases/get-missing-ids-by-linked-request.use-case';
import { Rep01TagRepository } from './infrastructure/repositories/rep01-tag.repository';
import { REP01_TAG_REPOSITORY } from './domain/repositories/rep01-tag.repository.interface';

@Module({
  controllers: [Rep01TagsController],
  providers: [
    Rep01TagsService,
    // Repository
    {
      provide: REP01_TAG_REPOSITORY,
      useClass: Rep01TagRepository,
    },
    // Use Cases
    {
      provide: GetAllRep01TagsUseCase,
      useFactory: (repository) => new GetAllRep01TagsUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
    {
      provide: CreateRep01TagUseCase,
      useFactory: (repository) => new CreateRep01TagUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
    {
      provide: DeleteAllRep01TagsUseCase,
      useFactory: (repository) => new DeleteAllRep01TagsUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
    {
      provide: ImportRep01TagsUseCase,
      useFactory: (repository) => new ImportRep01TagsUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
    {
      provide: GetRequestIdsByAdditionalInfoUseCase,
      useFactory: (repository) => new GetRequestIdsByAdditionalInfoUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
    {
      provide: GetMissingIdsByLinkedRequestUseCase,
      useFactory: (repository) => new GetMissingIdsByLinkedRequestUseCase(repository),
      inject: [REP01_TAG_REPOSITORY],
    },
  ],
})
export class Rep01TagsModule {}
