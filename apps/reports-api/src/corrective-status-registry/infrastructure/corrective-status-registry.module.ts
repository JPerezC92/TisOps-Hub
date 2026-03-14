import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { CORRECTIVE_STATUS_REGISTRY_REPOSITORY } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusRegistryRepository } from '@corrective-status-registry/infrastructure/repositories/corrective-status-registry.repository';
import { CorrectiveStatusRegistryController } from '@corrective-status-registry/infrastructure/corrective-status-registry.controller';
import { GetAllCorrectiveStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from '@corrective-status-registry/application/use-cases/get-corrective-status-by-id.use-case';
import { GetDistinctDisplayStatusesUseCase } from '@corrective-status-registry/application/use-cases/get-distinct-display-statuses.use-case';
import { CreateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from '@corrective-status-registry/application/use-cases/delete-corrective-status.use-case';

@Module({
  controllers: [CorrectiveStatusRegistryController],
  providers: [
    {
      provide: CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
      useFactory: (db) => new CorrectiveStatusRegistryRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllCorrectiveStatusesUseCase,
      useFactory: (repo) => new GetAllCorrectiveStatusesUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetCorrectiveStatusByIdUseCase,
      useFactory: (repo) => new GetCorrectiveStatusByIdUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetDistinctDisplayStatusesUseCase,
      useFactory: (repo) => new GetDistinctDisplayStatusesUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateCorrectiveStatusUseCase,
      useFactory: (repo) => new CreateCorrectiveStatusUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateCorrectiveStatusUseCase,
      useFactory: (repo) => new UpdateCorrectiveStatusUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteCorrectiveStatusUseCase,
      useFactory: (repo) => new DeleteCorrectiveStatusUseCase(repo),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
  ],
})
export class CorrectiveStatusRegistryModule {}
