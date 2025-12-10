import { Inject, Injectable } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';

@Injectable()
export class GetDistinctDisplayStatusesUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(): Promise<string[]> {
    return this.repository.findDistinctDisplayStatuses();
  }
}
