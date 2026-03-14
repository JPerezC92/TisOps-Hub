import {
  CreateCorrectiveStatusDto,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

export class CreateCorrectiveStatusUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(data: CreateCorrectiveStatusDto): Promise<CorrectiveStatus> {
    return this.repository.create(data);
  }
}
