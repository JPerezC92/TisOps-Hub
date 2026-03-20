import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { RequestTagsController } from '@request-tags/infrastructure/request-tags.controller';
import { RequestTagRepository } from '@request-tags/infrastructure/repositories/request-tag.repository';
import { REQUEST_TAG_REPOSITORY } from '@request-tags/domain/repositories/request-tag.repository.interface';
import type { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';
import { GetAllRequestTagsUseCase } from '@request-tags/application/use-cases/get-all-request-tags.use-case';
import { CreateRequestTagUseCase } from '@request-tags/application/use-cases/create-request-tag.use-case';
import { DeleteAllRequestTagsUseCase } from '@request-tags/application/use-cases/delete-all-request-tags.use-case';
import { ImportRequestTagsUseCase } from '@request-tags/application/use-cases/import-request-tags.use-case';
import { GetRequestIdsByAdditionalInfoUseCase } from '@request-tags/application/use-cases/get-request-ids-by-additional-info.use-case';
import { GetMissingIdsByLinkedRequestUseCase } from '@request-tags/application/use-cases/get-missing-ids-by-linked-request.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [
    DatabaseModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [RequestTagsController],
  providers: [
    {
      provide: REQUEST_TAG_REPOSITORY,
      useClass: RequestTagRepository,
    },
    {
      provide: GetAllRequestTagsUseCase,
      useFactory: (repo: IRequestTagRepository) => new GetAllRequestTagsUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: CreateRequestTagUseCase,
      useFactory: (repo: IRequestTagRepository) => new CreateRequestTagUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: DeleteAllRequestTagsUseCase,
      useFactory: (repo: IRequestTagRepository) => new DeleteAllRequestTagsUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: ImportRequestTagsUseCase,
      useFactory: (repo: IRequestTagRepository) => new ImportRequestTagsUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: GetRequestIdsByAdditionalInfoUseCase,
      useFactory: (repo: IRequestTagRepository) => new GetRequestIdsByAdditionalInfoUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
    {
      provide: GetMissingIdsByLinkedRequestUseCase,
      useFactory: (repo: IRequestTagRepository) => new GetMissingIdsByLinkedRequestUseCase(repo),
      inject: [REQUEST_TAG_REPOSITORY],
    },
  ],
})
export class RequestTagsModule {}
