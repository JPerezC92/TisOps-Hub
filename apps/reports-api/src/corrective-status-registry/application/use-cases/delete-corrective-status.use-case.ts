import { Inject, Injectable } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';

@Injectable()
export class DeleteCorrectiveStatusUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
