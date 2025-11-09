import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

export class GetAllRequestCategorizationsUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(): Promise<RequestCategorizationEntity[]> {
    return this.repository.findAll();
  }
}
