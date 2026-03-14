import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  type IApplicationRegistryRepository,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationRegistryRepository } from '@application-registry/infrastructure/repositories/application-registry.repository';
import { ApplicationRegistryController } from '@application-registry/infrastructure/application-registry.controller';
import { GetAllApplicationsUseCase } from '@application-registry/application/use-cases/get-all-applications.use-case';
import { GetApplicationByIdUseCase } from '@application-registry/application/use-cases/get-application-by-id.use-case';
import { FindApplicationByNameUseCase } from '@application-registry/application/use-cases/find-application-by-name.use-case';
import { GetApplicationsWithPatternsUseCase } from '@application-registry/application/use-cases/get-applications-with-patterns.use-case';
import { CreateApplicationUseCase } from '@application-registry/application/use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from '@application-registry/application/use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from '@application-registry/application/use-cases/delete-application.use-case';
import { CreatePatternUseCase } from '@application-registry/application/use-cases/create-pattern.use-case';
import { DeletePatternUseCase } from '@application-registry/application/use-cases/delete-pattern.use-case';

@Module({
  controllers: [ApplicationRegistryController],
  providers: [
    {
      provide: APPLICATION_REGISTRY_REPOSITORY,
      useFactory: (db) => new ApplicationRegistryRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllApplicationsUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new GetAllApplicationsUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetApplicationByIdUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new GetApplicationByIdUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: FindApplicationByNameUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new FindApplicationByNameUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetApplicationsWithPatternsUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new GetApplicationsWithPatternsUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateApplicationUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new CreateApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateApplicationUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new UpdateApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteApplicationUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new DeleteApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreatePatternUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new CreatePatternUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeletePatternUseCase,
      useFactory: (repository: IApplicationRegistryRepository) =>
        new DeletePatternUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
  ],
})
export class ApplicationRegistryModule {}
