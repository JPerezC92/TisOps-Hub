import { Injectable, Inject } from '@nestjs/common';
import { GetAllApplicationsUseCase } from './application/use-cases/get-all-applications.use-case';
import { GetApplicationByIdUseCase } from './application/use-cases/get-application-by-id.use-case';
import { FindApplicationByNameUseCase } from './application/use-cases/find-application-by-name.use-case';
import { GetApplicationsWithPatternsUseCase } from './application/use-cases/get-applications-with-patterns.use-case';
import { CreateApplicationUseCase } from './application/use-cases/create-application.use-case';
import { UpdateApplicationUseCase } from './application/use-cases/update-application.use-case';
import { DeleteApplicationUseCase } from './application/use-cases/delete-application.use-case';
import { CreatePatternUseCase } from './application/use-cases/create-pattern.use-case';
import { DeletePatternUseCase } from './application/use-cases/delete-pattern.use-case';
import type {
  CreateApplicationDto,
  UpdateApplicationDto,
  CreatePatternDto,
} from './domain/repositories/application-registry.repository.interface';

@Injectable()
export class ApplicationRegistryService {
  constructor(
    @Inject(GetAllApplicationsUseCase)
    private readonly getAllUseCase: GetAllApplicationsUseCase,
    @Inject(GetApplicationByIdUseCase)
    private readonly getByIdUseCase: GetApplicationByIdUseCase,
    @Inject(FindApplicationByNameUseCase)
    private readonly findByNameUseCase: FindApplicationByNameUseCase,
    @Inject(GetApplicationsWithPatternsUseCase)
    private readonly getWithPatternsUseCase: GetApplicationsWithPatternsUseCase,
    @Inject(CreateApplicationUseCase)
    private readonly createUseCase: CreateApplicationUseCase,
    @Inject(UpdateApplicationUseCase)
    private readonly updateUseCase: UpdateApplicationUseCase,
    @Inject(DeleteApplicationUseCase)
    private readonly deleteUseCase: DeleteApplicationUseCase,
    @Inject(CreatePatternUseCase)
    private readonly createPatternUseCase: CreatePatternUseCase,
    @Inject(DeletePatternUseCase)
    private readonly deletePatternUseCase: DeletePatternUseCase,
  ) {}

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async findById(id: number) {
    return this.getByIdUseCase.execute(id);
  }

  async findByName(name: string) {
    return this.findByNameUseCase.execute(name);
  }

  async findAllWithPatterns() {
    return this.getWithPatternsUseCase.execute();
  }

  async create(data: CreateApplicationDto) {
    return this.createUseCase.execute(data);
  }

  async update(id: number, data: UpdateApplicationDto) {
    return this.updateUseCase.execute(id, data);
  }

  async delete(id: number) {
    return this.deleteUseCase.execute(id);
  }

  async createPattern(data: CreatePatternDto) {
    return this.createPatternUseCase.execute(data);
  }

  async deletePattern(id: number) {
    return this.deletePatternUseCase.execute(id);
  }
}
