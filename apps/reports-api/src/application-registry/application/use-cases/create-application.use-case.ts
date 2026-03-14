import {
  IApplicationRegistryRepository,
  CreateApplicationDto,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { Application } from '@application-registry/domain/entities/application.entity';

export class CreateApplicationUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(data: CreateApplicationDto): Promise<Application> {
    return this.repository.create(data);
  }
}
