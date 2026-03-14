import {
  ICorrectiveStatusRegistryRepository,
  UpdateCorrectiveStatusDto,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';
import { CorrectiveStatusNotFoundError } from '@corrective-status-registry/domain/errors/corrective-status-not-found.error';

export class UpdateCorrectiveStatusUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(id: number, data: UpdateCorrectiveStatusDto): Promise<CorrectiveStatus | CorrectiveStatusNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new CorrectiveStatusNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}
