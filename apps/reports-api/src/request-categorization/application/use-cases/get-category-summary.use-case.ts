import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';

export class GetCategorySummaryUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(): Promise<Array<{ category: string; count: number }>> {
    return this.repository.getCategorySummary();
  }
}
