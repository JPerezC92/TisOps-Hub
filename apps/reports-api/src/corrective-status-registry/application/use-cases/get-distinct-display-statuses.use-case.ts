import { ICorrectiveStatusRegistryRepository } from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';

export class GetDistinctDisplayStatusesUseCase {
  constructor(private readonly repository: ICorrectiveStatusRegistryRepository) {}

  async execute(): Promise<string[]> {
    return this.repository.findDistinctDisplayStatuses();
  }
}
