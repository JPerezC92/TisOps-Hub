import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';

export class GetCorrectiveStatusByIdUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(id: number): Promise<CorrectiveStatus | CorrectiveStatusNotFoundError> {
    const status = await this.repository.findById(id);
    if (!status) {
      return new CorrectiveStatusNotFoundError(id);
    }
    return status;
  }
}
