import {
  IApplicationRegistryRepository,
  ApplicationWithPatterns,
} from '@application-registry/domain/repositories/application-registry.repository.interface';

export class GetApplicationsWithPatternsUseCase {
  constructor(
    private readonly repository: IApplicationRegistryRepository,
  ) {}

  async execute(): Promise<ApplicationWithPatterns[]> {
    return this.repository.findAllWithPatterns();
  }
}
