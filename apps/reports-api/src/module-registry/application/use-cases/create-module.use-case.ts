import { Inject, Injectable } from '@nestjs/common';
import { Module } from '../../domain/entities/module.entity';
import {
  IModuleRegistryRepository,
  MODULE_REGISTRY_REPOSITORY,
  CreateModuleDto,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class CreateModuleUseCase {
  constructor(
    @Inject(MODULE_REGISTRY_REPOSITORY)
    private readonly repository: IModuleRegistryRepository,
  ) {}

  async execute(data: CreateModuleDto): Promise<Module> {
    return this.repository.create(data);
  }
}
