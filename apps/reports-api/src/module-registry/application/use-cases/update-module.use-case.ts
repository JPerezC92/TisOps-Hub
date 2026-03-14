import {
  IModuleRegistryRepository,
  UpdateModuleDto,
} from '@module-registry/domain/repositories/module-registry.repository.interface';
import { Module } from '@module-registry/domain/entities/module.entity';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';

export class UpdateModuleUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(id: number, data: UpdateModuleDto): Promise<Module | ModuleNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new ModuleNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}
