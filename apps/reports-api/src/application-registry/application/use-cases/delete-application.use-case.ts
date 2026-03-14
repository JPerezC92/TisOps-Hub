import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationNotFoundError } from '@application-registry/domain/errors/application-not-found.error';

export class DeleteApplicationUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number): Promise<void | ApplicationNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new ApplicationNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
