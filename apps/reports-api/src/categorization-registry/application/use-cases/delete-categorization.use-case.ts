import { Inject, Injectable } from '@nestjs/common';
import {
  ICategorizationRegistryRepository,
  CATEGORIZATION_REGISTRY_REPOSITORY,
} from '../../domain/repositories/categorization-registry.repository.interface';

@Injectable()
export class DeleteCategorizationUseCase {
  constructor(
    @Inject(CATEGORIZATION_REGISTRY_REPOSITORY)
    private readonly repository: ICategorizationRegistryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    return this.repository.delete(id);
  }
}
