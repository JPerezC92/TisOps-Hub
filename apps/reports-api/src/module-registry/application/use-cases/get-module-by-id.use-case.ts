import { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { Module } from '@module-registry/domain/entities/module.entity';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';

export class GetModuleByIdUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(id: number): Promise<Module | ModuleNotFoundError> {
    const module = await this.repository.findById(id);
    if (!module) {
      return new ModuleNotFoundError(id);
    }
    return module;
  }
}
