import {
  ICategorizationRegistryRepository,
  UpdateCategorizationDto,
} from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';
import { CategorizationNotFoundError } from '@categorization-registry/domain/errors/categorization-not-found.error';

export class UpdateCategorizationUseCase {
  constructor(private readonly repository: ICategorizationRegistryRepository) {}

  async execute(id: number, data: UpdateCategorizationDto): Promise<Categorization | CategorizationNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new CategorizationNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}
