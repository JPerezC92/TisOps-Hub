import { IApplicationRegistryRepository } from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationPatternNotFoundError } from '@application-registry/domain/errors/application-pattern-not-found.error';

export class DeletePatternUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number): Promise<void | ApplicationPatternNotFoundError> {
    const deleted = await this.repository.deletePattern(id);
    if (!deleted) {
      return new ApplicationPatternNotFoundError(id);
    }
  }
}
