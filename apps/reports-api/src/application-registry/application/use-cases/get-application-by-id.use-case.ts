import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';

export class GetApplicationByIdUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number): Promise<Application | ApplicationNotFoundError> {
    const application = await this.repository.findById(id);
    if (!application) {
      return new ApplicationNotFoundError(id);
    }
    return application;
  }
}
