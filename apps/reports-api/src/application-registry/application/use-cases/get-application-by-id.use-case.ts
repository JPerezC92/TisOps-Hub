import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  IApplicationRegistryRepository,
} from '../../domain/repositories/application-registry.repository.interface';
import { Application } from '../../domain/entities/application.entity';

@Injectable()
export class GetApplicationByIdUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number): Promise<Application> {
    const application = await this.repository.findById(id);
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }
}
