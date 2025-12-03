import { Inject, Injectable } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  MODULE_REGISTRY_REPOSITORY,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class GetModulesByApplicationUseCase {
  constructor(
    @Inject(MODULE_REGISTRY_REPOSITORY)
    private readonly repository: IModuleRegistryRepository,
  ) {}

  async execute(application: string): Promise<Module[]> {
    return this.repository.findByApplication(application);
  }
}
