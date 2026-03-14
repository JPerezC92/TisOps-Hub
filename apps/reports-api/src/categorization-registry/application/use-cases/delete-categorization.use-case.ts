import { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { CategorizationNotFoundError } from '@categorization-registry/domain/errors/categorization-not-found.error';

export class DeleteCategorizationUseCase {
  constructor(private readonly repository: ICategorizationRegistryRepository) {}

  async execute(id: number): Promise<void | CategorizationNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new CategorizationNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
