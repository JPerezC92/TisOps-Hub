import { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { Module } from '@module-registry/domain/entities/module.entity';

export class GetAllModulesUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(): Promise<Module[]> {
    return this.repository.findAll();
  }
}
