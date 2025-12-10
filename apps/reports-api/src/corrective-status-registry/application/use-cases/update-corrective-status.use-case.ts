import { Inject, Injectable } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  ICorrectiveStatusRegistryRepository,
  UpdateCorrectiveStatusDto,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

@Injectable()
export class UpdateCorrectiveStatusUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateCorrectiveStatusDto): Promise<CorrectiveStatus> {
    return this.repository.update(id, data);
  }
}
