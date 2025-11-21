import { Inject, Injectable } from '@nestjs/common';
import {
  APPLICATION_REGISTRY_REPOSITORY,
  CreatePatternDto,
  IApplicationRegistryRepository,
} from '../../domain/repositories/application-registry.repository.interface';
import { ApplicationPattern } from '../../domain/entities/application-pattern.entity';

@Injectable()
export class CreatePatternUseCase {
  constructor(
    @Inject(APPLICATION_REGISTRY_REPOSITORY)
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(data: CreatePatternDto): Promise<ApplicationPattern> {
    return this.repository.createPattern(data);
  }
}
