import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

export class CreateManyRequestCategorizationsUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(
    entities: RequestCategorizationEntity[],
  ): Promise<RequestCategorizationEntity[]> {
    return this.repository.createMany(entities);
  }
}
