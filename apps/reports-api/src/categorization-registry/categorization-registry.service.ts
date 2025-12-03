import { Injectable } from '@nestjs/common';
import { Categorization } from './domain/entities/categorization.entity';
import {
  CreateCategorizationDto,
  UpdateCategorizationDto,
} from './domain/repositories/categorization-registry.repository.interface';
import { GetAllCategorizationsUseCase } from './application/use-cases/get-all-categorizations.use-case';
import { GetCategorizationByIdUseCase } from './application/use-cases/get-categorization-by-id.use-case';
import { CreateCategorizationUseCase } from './application/use-cases/create-categorization.use-case';
import { UpdateCategorizationUseCase } from './application/use-cases/update-categorization.use-case';
import { DeleteCategorizationUseCase } from './application/use-cases/delete-categorization.use-case';

@Injectable()
export class CategorizationRegistryService {
  constructor(
    private readonly getAllCategorizationsUseCase: GetAllCategorizationsUseCase,
    private readonly getCategorizationByIdUseCase: GetCategorizationByIdUseCase,
    private readonly createCategorizationUseCase: CreateCategorizationUseCase,
    private readonly updateCategorizationUseCase: UpdateCategorizationUseCase,
    private readonly deleteCategorizationUseCase: DeleteCategorizationUseCase,
  ) {}

  async findAll(): Promise<Categorization[]> {
    return this.getAllCategorizationsUseCase.execute();
  }

  async findById(id: number): Promise<Categorization | null> {
    return this.getCategorizationByIdUseCase.execute(id);
  }

  async create(data: CreateCategorizationDto): Promise<Categorization> {
    return this.createCategorizationUseCase.execute(data);
  }

  async update(id: number, data: UpdateCategorizationDto): Promise<Categorization> {
    return this.updateCategorizationUseCase.execute(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.deleteCategorizationUseCase.execute(id);
  }
}
