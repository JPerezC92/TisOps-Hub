import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  IApplicationRegistryRepository,
} from '../../domain/repositories/application-registry.repository.interface';

@Injectable()
export class DeletePatternUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.repository.deletePattern(id);
  }
}
