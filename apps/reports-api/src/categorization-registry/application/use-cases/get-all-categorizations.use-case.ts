import { ICategorizationRegistryRepository } from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';

export class GetAllCategorizationsUseCase {
  constructor(private readonly repository: ICategorizationRegistryRepository) {}

  async execute(): Promise<Categorization[]> {
    return this.repository.findAll();
  }
}
