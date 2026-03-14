import { IModuleRegistryRepository } from '@module-registry/domain/repositories/module-registry.repository.interface';
import { ModuleNotFoundError } from '@module-registry/domain/errors/module-not-found.error';

export class DeleteModuleUseCase {
  constructor(private readonly repository: IModuleRegistryRepository) {}

  async execute(id: number): Promise<void | ModuleNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new ModuleNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
