import {
  ICategorizationRegistryRepository,
  CreateCategorizationDto,
} from '@categorization-registry/domain/repositories/categorization-registry.repository.interface';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';

export class CreateCategorizationUseCase {
  constructor(private readonly repository: ICategorizationRegistryRepository) {}

  async execute(data: CreateCategorizationDto): Promise<Categorization> {
    return this.repository.create(data);
  }
}
