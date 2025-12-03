import { Inject, Injectable } from '@nestjs/common';
import { Categorization } from '../../domain/entities/categorization.entity';
import {
  ICategorizationRegistryRepository,
  CATEGORIZATION_REGISTRY_REPOSITORY,
  CreateCategorizationDto,
} from '../../domain/repositories/categorization-registry.repository.interface';

@Injectable()
export class CreateCategorizationUseCase {
  constructor(
    @Inject(CATEGORIZATION_REGISTRY_REPOSITORY)
    private readonly repository: ICategorizationRegistryRepository,
  ) {}

  async execute(data: CreateCategorizationDto): Promise<Categorization> {
    return this.repository.create(data);
  }
}
