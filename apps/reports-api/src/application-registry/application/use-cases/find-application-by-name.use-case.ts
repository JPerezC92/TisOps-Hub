import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';

export class FindApplicationByNameUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(applicationName: string): Promise<Application | null> {
    return this.repository.findByPattern(applicationName);
  }
}
