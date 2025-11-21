import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  IApplicationRegistryRepository,
  UpdateApplicationDto,
} from '../../domain/repositories/application-registry.repository.interface';
import { Application } from '../../domain/entities/application.entity';

@Injectable()
export class UpdateApplicationUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(id: number, data: UpdateApplicationDto): Promise<Application> {
    return this.repository.update(id, data);
  }
}
