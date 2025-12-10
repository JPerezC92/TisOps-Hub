import { Inject, Injectable } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  CreateCorrectiveStatusDto,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

@Injectable()
export class CreateCorrectiveStatusUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(data: CreateCorrectiveStatusDto): Promise<CorrectiveStatus> {
    return this.repository.create(data);
  }
}
