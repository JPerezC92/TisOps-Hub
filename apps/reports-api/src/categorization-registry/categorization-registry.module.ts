import { Module } from '@nestjs/common';
import { CategorizationRegistryController } from './categorization-registry.controller';
import { CategorizationRegistryService } from './categorization-registry.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { CategorizationRegistryRepository } from './infrastructure/repositories/categorization-registry.repository';
import { CATEGORIZATION_REGISTRY_REPOSITORY } from './domain/repositories/categorization-registry.repository.interface';
import { GetAllCategorizationsUseCase } from './application/use-cases/get-all-categorizations.use-case';
import { GetCategorizationByIdUseCase } from './application/use-cases/get-categorization-by-id.use-case';
import { CreateCategorizationUseCase } from './application/use-cases/create-categorization.use-case';
import { UpdateCategorizationUseCase } from './application/use-cases/update-categorization.use-case';
import { DeleteCategorizationUseCase } from './application/use-cases/delete-categorization.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CategorizationRegistryController],
  providers: [
    CategorizationRegistryService,
    {
      provide: CATEGORIZATION_REGISTRY_REPOSITORY,
      useClass: CategorizationRegistryRepository,
    },
    {
      provide: GetAllCategorizationsUseCase,
      useFactory: (repository: any) => new GetAllCategorizationsUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetCategorizationByIdUseCase,
      useFactory: (repository: any) => new GetCategorizationByIdUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateCategorizationUseCase,
      useFactory: (repository: any) => new CreateCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateCategorizationUseCase,
      useFactory: (repository: any) => new UpdateCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteCategorizationUseCase,
      useFactory: (repository: any) => new DeleteCategorizationUseCase(repository),
      inject: [CATEGORIZATION_REGISTRY_REPOSITORY],
    },
  ],
  exports: [CategorizationRegistryService],
})
export class CategorizationRegistryModule {}
