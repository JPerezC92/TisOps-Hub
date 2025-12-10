import { Inject, Injectable } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

@Injectable()
export class GetAllCorrectiveStatusesUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(): Promise<CorrectiveStatus[]> {
    return this.repository.findAll();
  }
}
