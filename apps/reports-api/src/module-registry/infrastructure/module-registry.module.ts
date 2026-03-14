import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import {
  MODULE_REGISTRY_REPOSITORY,
  type IModuleRegistryRepository,
} from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleRegistryRepository } from '@module-registry/infrastructure/repositories/module-registry.repository';
import { ModuleRegistryController } from '@module-registry/infrastructure/module-registry.controller';
import { GetAllModulesUseCase } from '@module-registry/application/use-cases/get-all-modules.use-case';
import { GetModuleByIdUseCase } from '@module-registry/application/use-cases/get-module-by-id.use-case';
import { GetModulesByApplicationUseCase } from '@module-registry/application/use-cases/get-modules-by-application.use-case';
import { CreateModuleUseCase } from '@module-registry/application/use-cases/create-module.use-case';
import { UpdateModuleUseCase } from '@module-registry/application/use-cases/update-module.use-case';
import { DeleteModuleUseCase } from '@module-registry/application/use-cases/delete-module.use-case';

@Module({
  controllers: [ModuleRegistryController],
  providers: [
    {
      provide: MODULE_REGISTRY_REPOSITORY,
      useFactory: (db) => new ModuleRegistryRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllModulesUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new GetAllModulesUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: GetModuleByIdUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new GetModuleByIdUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: GetModulesByApplicationUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new GetModulesByApplicationUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: CreateModuleUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new CreateModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: UpdateModuleUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new UpdateModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
    {
      provide: DeleteModuleUseCase,
      useFactory: (repository: IModuleRegistryRepository) =>
        new DeleteModuleUseCase(repository),
      inject: [MODULE_REGISTRY_REPOSITORY],
    },
  ],
})
export class ModuleRegistryModule {}
