import { Inject, Injectable } from '@nestjs/common';
import { Categorization } from '../../domain/entities/categorization.entity';
import {
  ICategorizationRegistryRepository,
  CATEGORIZATION_REGISTRY_REPOSITORY,
} from '../../domain/repositories/categorization-registry.repository.interface';

@Injectable()
export class GetAllCategorizationsUseCase {
  constructor(
    @Inject(CATEGORIZATION_REGISTRY_REPOSITORY)
    private readonly repository: ICategorizationRegistryRepository,
  ) {}

  async execute(): Promise<Categorization[]> {
    return this.repository.findAll();
  }
}
