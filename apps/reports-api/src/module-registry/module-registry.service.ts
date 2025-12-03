import { Injectable } from '@nestjs/common';
import { Module } from './domain/entities/module.entity';
import {
  CreateModuleDto,
  UpdateModuleDto,
} from './domain/repositories/module-registry.repository.interface';
import { GetAllModulesUseCase } from './application/use-cases/get-all-modules.use-case';
import { GetModuleByIdUseCase } from './application/use-cases/get-module-by-id.use-case';
import { GetModulesByApplicationUseCase } from './application/use-cases/get-modules-by-application.use-case';
import { CreateModuleUseCase } from './application/use-cases/create-module.use-case';
import { UpdateModuleUseCase } from './application/use-cases/update-module.use-case';
import { DeleteModuleUseCase } from './application/use-cases/delete-module.use-case';

@Injectable()
export class ModuleRegistryService {
  constructor(
    private readonly getAllModulesUseCase: GetAllModulesUseCase,
    private readonly getModuleByIdUseCase: GetModuleByIdUseCase,
    private readonly getModulesByApplicationUseCase: GetModulesByApplicationUseCase,
    private readonly createModuleUseCase: CreateModuleUseCase,
    private readonly updateModuleUseCase: UpdateModuleUseCase,
    private readonly deleteModuleUseCase: DeleteModuleUseCase,
  ) {}

  async findAll(): Promise<Module[]> {
    return this.getAllModulesUseCase.execute();
  }

  async findById(id: number): Promise<Module | null> {
    return this.getModuleByIdUseCase.execute(id);
  }

  async findByApplication(application: string): Promise<Module[]> {
    return this.getModulesByApplicationUseCase.execute(application);
  }

  async create(data: CreateModuleDto): Promise<Module> {
    return this.createModuleUseCase.execute(data);
  }

  async update(id: number, data: UpdateModuleDto): Promise<Module> {
    return this.updateModuleUseCase.execute(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.deleteModuleUseCase.execute(id);
  }
}
