import { Injectable, Inject } from '@nestjs/common';
import { GetAllCorrectiveStatusesUseCase } from './application/use-cases/get-all-corrective-statuses.use-case';
import { GetCorrectiveStatusByIdUseCase } from './application/use-cases/get-corrective-status-by-id.use-case';
import { CreateCorrectiveStatusUseCase } from './application/use-cases/create-corrective-status.use-case';
import { UpdateCorrectiveStatusUseCase } from './application/use-cases/update-corrective-status.use-case';
import { DeleteCorrectiveStatusUseCase } from './application/use-cases/delete-corrective-status.use-case';
import { GetDistinctDisplayStatusesUseCase } from './application/use-cases/get-distinct-display-statuses.use-case';
import type {
  CreateCorrectiveStatusDto,
  UpdateCorrectiveStatusDto,
} from './domain/repositories/corrective-status-registry.repository.interface';

@Injectable()
export class CorrectiveStatusRegistryService {
  constructor(
    @Inject(GetAllCorrectiveStatusesUseCase)
    private readonly getAllUseCase: GetAllCorrectiveStatusesUseCase,
    @Inject(GetCorrectiveStatusByIdUseCase)
    private readonly getByIdUseCase: GetCorrectiveStatusByIdUseCase,
    @Inject(CreateCorrectiveStatusUseCase)
    private readonly createUseCase: CreateCorrectiveStatusUseCase,
    @Inject(UpdateCorrectiveStatusUseCase)
    private readonly updateUseCase: UpdateCorrectiveStatusUseCase,
    @Inject(DeleteCorrectiveStatusUseCase)
    private readonly deleteUseCase: DeleteCorrectiveStatusUseCase,
    @Inject(GetDistinctDisplayStatusesUseCase)
    private readonly getDistinctDisplayStatusesUseCase: GetDistinctDisplayStatusesUseCase,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async findById(id: number) {
    return this.getByIdUseCase.execute(id);
  }

  async create(data: CreateCorrectiveStatusDto) {
    return this.createUseCase.execute(data);
  }

  async update(id: number, data: UpdateCorrectiveStatusDto) {
    return this.updateUseCase.execute(id, data);
  }

  async delete(id: number) {
    return this.deleteUseCase.execute(id);
  }

  async getDistinctDisplayStatuses() {
    return this.getDistinctDisplayStatusesUseCase.execute();
  }
}
