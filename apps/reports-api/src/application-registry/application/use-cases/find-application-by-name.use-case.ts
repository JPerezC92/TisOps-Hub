import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  IApplicationRegistryRepository,
} from '../../domain/repositories/application-registry.repository.interface';
import { Application } from '../../domain/entities/application.entity';

@Injectable()
export class FindApplicationByNameUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(applicationName: string): Promise<Application | null> {
    return this.repository.findByPattern(applicationName);
  }
}
