import { Inject, Injectable } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  MODULE_REGISTRY_REPOSITORY,
  UpdateModuleDto,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class UpdateModuleUseCase {
  constructor(
    @Inject(MODULE_REGISTRY_REPOSITORY)
    private readonly repository: IModuleRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateModuleDto): Promise<Module> {
    return this.repository.update(id, data);
  }
}
