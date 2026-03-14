import {
  IApplicationRegistryRepository,
  CreatePatternDto,
} from '@application-registry/domain/repositories/application-registry.repository.interface';
import { ApplicationPattern } from '@application-registry/domain/entities/application-pattern.entity';

export class CreatePatternUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(data: CreatePatternDto): Promise<ApplicationPattern> {
    return this.repository.createPattern(data);
  }
}
