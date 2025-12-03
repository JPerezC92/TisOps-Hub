import { Inject, Injectable } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  MODULE_REGISTRY_REPOSITORY,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class GetModuleByIdUseCase {
  constructor(
    @Inject(MODULE_REGISTRY_REPOSITORY)
    private readonly repository: IModuleRegistryRepository,
  ) {}

  async execute(id: number): Promise<Module | null> {
    return this.repository.findById(id);
  }
}
