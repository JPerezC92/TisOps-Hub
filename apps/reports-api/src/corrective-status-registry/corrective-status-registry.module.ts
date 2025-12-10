import { Module } from '@nestjs/common';
import { CorrectiveStatusRegistryController } from './corrective-status-registry.controller';
import { CorrectiveStatusRegistryService } from './corrective-status-registry.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { CorrectiveStatusRegistryRepository } from './infrastructure/repositories/corrective-status-registry.repository';
import { CORRECTIVE_STATUS_REGISTRY_REPOSITORY } from './domain/repositories/corrective-status-registry.repository.interface';
import { GetAllCorrectiveStatusesUseCase } from './application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from './application/use-cases/get-corrective-status-by-id.use-case';
import { CreateCorrectiveStatusUseCase } from './application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from './application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from './application/use-cases/delete-corrective-status.use-case';
import { GetDistinctDisplayStatusesUseCase } from './application/use-cases/get-distinct-display-statuses.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [CorrectiveStatusRegistryController],
  providers: [
    CorrectiveStatusRegistryService,
    {
      provide: CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
      useClass: CorrectiveStatusRegistryRepository,
    },
    {
      provide: GetAllCorrectiveStatusesUseCase,
      useFactory: (repository: any) => new GetAllCorrectiveStatusesUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetCorrectiveStatusByIdUseCase,
      useFactory: (repository: any) => new GetCorrectiveStatusByIdUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateCorrectiveStatusUseCase,
      useFactory: (repository: any) => new CreateCorrectiveStatusUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateCorrectiveStatusUseCase,
      useFactory: (repository: any) => new UpdateCorrectiveStatusUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteCorrectiveStatusUseCase,
      useFactory: (repository: any) => new DeleteCorrectiveStatusUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
    {
      provide: GetDistinctDisplayStatusesUseCase,
      useFactory: (repository: any) => new GetDistinctDisplayStatusesUseCase(repository),
      inject: [CORRECTIVE_STATUS_REGISTRY_REPOSITORY],
    },
  ],
  exports: [CorrectiveStatusRegistryService],
})
export class CorrectiveStatusRegistryModule {}
