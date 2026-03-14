import {
  IModuleRegistryRepository,
  CreateModuleDto,
} from '@module-registry/domain/repositories/module-registry.repository.interface';
import { Module } from '@module-registry/domain/entities/module.entity';

export class CreateModuleUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(data: CreateModuleDto): Promise<Module> {
    return this.repository.create(data);
  }
}
