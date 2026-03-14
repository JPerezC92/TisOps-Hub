import {
  IApplicationRegistryRepository,
  UpdateApplicationDto,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';

export class UpdateApplicationUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateApplicationDto): Promise<Application | ApplicationNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new ApplicationNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}
