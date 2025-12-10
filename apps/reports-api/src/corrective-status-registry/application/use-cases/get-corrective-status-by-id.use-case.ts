import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CORRECTIVE_STATUS_REGISTRY_REPOSITORY,
  ICorrectiveStatusRegistryRepository,
} from '@corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

@Injectable()
export class GetCorrectiveStatusByIdUseCase {
  constructor(
    @Inject(CORRECTIVE_STATUS_REGISTRY_REPOSITORY)
    private readonly repository: ICorrectiveStatusRegistryRepository,
  ) {}

  async execute(id: number): Promise<CorrectiveStatus> {
    const status = await this.repository.findById(id);
    if (!status) {
      throw new NotFoundException(`Corrective status with ID ${id} not found`);
    }
    return status;
  }
}
