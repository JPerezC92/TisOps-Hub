import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';

export class GetAllApplicationsUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(): Promise<Application[]> {
    return this.repository.findAll();
  }
}
