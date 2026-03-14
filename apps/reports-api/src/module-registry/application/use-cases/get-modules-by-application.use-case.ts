import { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { Module } from '@module-registry/domain/entities/module.entity';

export class GetModulesByApplicationUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(application: string): Promise<Module[]> {
    return this.repository.findByApplication(application);
  }
}
