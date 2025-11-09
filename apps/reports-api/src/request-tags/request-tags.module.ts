import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RequestTagsController } from './request-tags.controller';
import { RequestTagsService } from './request-tags.service';
import { GetAllRequestTagsUseCase } from './application/use-cases/get-all-request-tags.use-case';
import { CreateRequestTagUseCase } from './application/use-cases/create-request-tag.use-case';
import { DeleteAllRequestTagsUseCase } from './application/use-cases/delete-all-request-tags.use-case';
import { ImportRequestTagsUseCase } from './application/use-cases/import-request-tags.use-case';
import { GetRequestIdsByAdditionalInfoUseCase } from './application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from './application/use-cases/get-missing-ids-by-linked-request.use-case';
import { RequestTagRepository } from './infrastructure/repositories/request-tag.repository';
import { REQUEST_TAG_REPOSITORY } from './domain/repositories/request-tag.repository.interface';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
      },
    }),
  ],
  controllers: [RequestTagsController],
  providers: [
    RequestTagsService,
    // Repository
    {
      provide: REQUEST_TAG_REPOSITORY,
      useClass: RequestTagRepository,
    },
    // Use Cases
    {
      provide: GetAllRequestTagsUseCase,
      useFactory: (repository) => new GetAllRequestTagsUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: CreateRequestTagUseCase,
      useFactory: (repository) => new CreateRequestTagUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: DeleteAllRequestTagsUseCase,
      useFactory: (repository) => new DeleteAllRequestTagsUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: ImportRequestTagsUseCase,
      useFactory: (repository) => new ImportRequestTagsUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: GetRequestIdsByAdditionalInfoUseCase,
      useFactory: (repository) => new GetRequestIdsByAdditionalInfoUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: GetMissingIdsByLinkedRequestUseCase,
      useFactory: (repository) => new GetMissingIdsByLinkedRequestUseCase(repository),
      inject: [REQUEST_TAG_REPOSITORY],
    },
  ],
})
export class RequestTagsModule {}
