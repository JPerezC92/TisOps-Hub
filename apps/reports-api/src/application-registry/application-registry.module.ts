import { Module } from '@nestjs/common';
import { ApplicationRegistryController } from './application-registry.controller';
import { ApplicationRegistryService } from './application-registry.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { ApplicationRegistryRepository } from './infrastructure/repositories/application-registry.repository';
import { APPLICATION_REGISTRY_REPOSITORY } from './domain/repositories/application-registry.repository.interface';
import { GetAllApplicationsUseCase } from './application/use-cases/get-all-applications.use-case';
import { GetApplicationByIdUseCase } from './application/use-cases/get-application-by-id.use-case';
import { FindApplicationByNameUseCase } from './application/use-cases/find-application-by-name.use-case';
import { GetApplicationsWithPatternsUseCase } from './application/use-cases/get-applications-with-patterns.use-case';
import { CreateApplicationUseCase } from './application/use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from './application/use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from './application/use-cases/delete-application.use-case';
import { CreatePatternUseCase } from './application/use-cases/create-pattern.use-case';
import { DeletePatternUseCase } from './application/use-cases/delete-pattern.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ApplicationRegistryController],
  providers: [
    ApplicationRegistryService,
    {
      provide: APPLICATION_REGISTRY_REPOSITORY,
      useClass: ApplicationRegistryRepository,
    },
    {
      provide: GetAllApplicationsUseCase,
      useFactory: (repository: any) => new GetAllApplicationsUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetApplicationByIdUseCase,
      useFactory: (repository: any) => new GetApplicationByIdUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: FindApplicationByNameUseCase,
      useFactory: (repository: any) => new FindApplicationByNameUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: GetApplicationsWithPatternsUseCase,
      useFactory: (repository: any) => new GetApplicationsWithPatternsUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateApplicationUseCase,
      useFactory: (repository: any) => new CreateApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateApplicationUseCase,
      useFactory: (repository: any) => new UpdateApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteApplicationUseCase,
      useFactory: (repository: any) => new DeleteApplicationUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: CreatePatternUseCase,
      useFactory: (repository: any) => new CreatePatternUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
    {
      provide: DeletePatternUseCase,
      useFactory: (repository: any) => new DeletePatternUseCase(repository),
      inject: [APPLICATION_REGISTRY_REPOSITORY],
    },
  ],
  exports: [ApplicationRegistryService],
})
export class ApplicationRegistryModule {}
