import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  CreateApplicationDto,
  IApplicationRegistryRepository,
} from '../../domain/repositories/application-registry.repository.interface';
import { Application } from '../../domain/entities/application.entity';

@Injectable()
export class CreateApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(data: CreateApplicationDto): Promise<Application> {
    return this.repository.create(data);
  }
}
