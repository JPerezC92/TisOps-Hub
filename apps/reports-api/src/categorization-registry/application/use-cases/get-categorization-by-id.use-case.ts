import { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';
import { CategorizationNotFoundError } from '@categorization-registry/domain/errors/categorization-not-found.error';

export class GetCategorizationByIdUseCase {
  constructor(private readonly repository: ICategorizationRegistryRepository) {}

  async execute(id: number): Promise<Categorization | CategorizationNotFoundError> {
    const categorization = await this.repository.findById(id);
    if (!categorization) {
      return new CategorizationNotFoundError(id);
    }
    return categorization;
  }
}
