import { Module } from '@nestjs/common';
import { ModuleRegistryController } from './module-registry.controller';
import { ModuleRegistryService } from './module-registry.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { ModuleRegistryRepository } from './infrastructure/repositories/module-registry.repository';
import { MODULE_REGISTRY_REPOSITORY } from './domain/repositories/module-registry.repository.interface';
import { GetAllModulesUseCase } from './application/use-cases/get-all-modules.use-case';
import { GetModuleByIdUseCase } from './application/use-cases/get-module-by-id.use-case';
import { GetModulesByApplicationUseCase } from './application/use-cases/get-modules-by-application.use-case';
import { CreateModuleUseCase } from './application/use-cases/create-module.use-case';
import { UpdateModuleUseCase } from './application/use-cases/update-module.use-case';
import { DeleteModuleUseCase } from './application/use-cases/delete-module.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [ModuleRegistryController],
  providers: [
    ModuleRegistryService,
    {
      provide: MODULE_REGISTRY_REPOSITORY,
      useClass: ModuleRegistryRepository,
    },
    {
      provide: GetAllModulesUseCase,
      useFactory: (repository: any) => new GetAllModulesUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: GetModuleByIdUseCase,
      useFactory: (repository: any) => new GetModuleByIdUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: GetModulesByApplicationUseCase,
      useFactory: (repository: any) => new GetModulesByApplicationUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateModuleUseCase,
      useFactory: (repository: any) => new CreateModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateModuleUseCase,
      useFactory: (repository: any) => new UpdateModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteModuleUseCase,
      useFactory: (repository: any) => new DeleteModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
  ],
  exports: [ModuleRegistryService],
})
export class ModuleRegistryModule {}
