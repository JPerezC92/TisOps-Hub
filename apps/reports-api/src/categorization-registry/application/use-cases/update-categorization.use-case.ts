import { Inject, Injectable } from '@nestjs/common';
import { Categorization } from '../../domain/entities/categorization.entity';
import {
  ICategorizationRegistryRepository,
  CATEGORIZATION_REGISTRY_REPOSITORY,
  UpdateCategorizationDto,
} from '../../domain/repositories/categorization-registry.repository.interface';

@Injectable()
export class UpdateCategorizationUseCase {
  constructor(
    @Inject(CATEGORIZATION_REGISTRY_REPOSITORY)
    private readonly repository: ICategorizationRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateCategorizationDto): Promise<Categorization> {
    return this.repository.update(id, data);
  }
}
