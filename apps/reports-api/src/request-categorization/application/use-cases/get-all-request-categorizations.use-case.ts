import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '../../domain/entities/request-categorization.entity';

export class GetAllRequestCategorizationsUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(): Promise<RequestCategorizationEntity[]> {
    return this.repository.findAll();
  }
}
