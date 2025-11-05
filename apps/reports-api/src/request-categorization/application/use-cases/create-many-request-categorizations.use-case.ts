import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '../../domain/entities/request-categorization.entity';

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
