import { Inject, Injectable } from '@nestjs/common';
import {
  IModuleRegistryRepository,
  MODULE_REGISTRY_REPOSITORY,
} from '../../domain/repositories/module-registry.repository.interface';

@Injectable()
export class DeleteModuleUseCase {
  constructor(
    @Inject(MODULE_REGISTRY_REPOSITORY)
    private readonly repository: IModuleRegistryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
