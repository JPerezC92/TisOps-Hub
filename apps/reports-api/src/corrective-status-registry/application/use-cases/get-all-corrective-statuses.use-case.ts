import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

export class GetAllCorrectiveStatusesUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(): Promise<CorrectiveStatus[]> {
    return this.repository.findAll();
  }
}
