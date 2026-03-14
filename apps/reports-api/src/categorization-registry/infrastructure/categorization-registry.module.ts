import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import {
  CATEGORIZATION_REGISTRY_REPOSITORY,
  type ICategorizationRegistryRepository,
} from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationRegistryRepository } from '@categorization-registry/infrastructure/repositories/categorization-registry.repository';
import { CategorizationRegistryController } from '@categorization-registry/infrastructure/categorization-registry.controller';
import { GetAllCategorizationsUseCase } from '@categorization-registry/application/use-cases/get-all-categorizations.use-case';
import { GetCategorizationByIdUseCase } from '@categorization-registry/application/use-cases/get-categorization-by-id.use-case';
import { CreateCategorizationUseCase } from '@categorization-registry/application/use-cases/create-categorization.use-case';
import { UpdateCategorizationUseCase } from '@categorization-registry/application/use-cases/update-categorization.use-case';
import { DeleteCategorizationUseCase } from '@categorization-registry/application/use-cases/delete-categorization.use-case';

@Module({
  controllers: [CategorizationRegistryController],
  providers: [
    {
      provide: CATEGORIZATION_REGISTRY_REPOSITORY,
      useFactory: (db) => new CategorizationRegistryRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllCategorizationsUseCase,
      useFactory: (repository: ICategorizationRegistryRepository) =>
        new GetAllCategorizationsUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetCategorizationByIdUseCase,
      useFactory: (repository: ICategorizationRegistryRepository) =>
        new GetCategorizationByIdUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateCategorizationUseCase,
      useFactory: (repository: ICategorizationRegistryRepository) =>
        new CreateCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateCategorizationUseCase,
      useFactory: (repository: ICategorizationRegistryRepository) =>
        new UpdateCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteCategorizationUseCase,
      useFactory: (repository: ICategorizationRegistryRepository) =>
        new DeleteCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
  ],
})
export class CategorizationRegistryModule {}
