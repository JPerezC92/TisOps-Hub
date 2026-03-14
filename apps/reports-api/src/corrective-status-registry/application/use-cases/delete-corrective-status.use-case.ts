import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';

export class DeleteCorrectiveStatusUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(id: number): Promise<void | CorrectiveStatusNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new CorrectiveStatusNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
