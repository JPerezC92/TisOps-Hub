import { IRequestCategorizationRepository } from '@request-categorization/domain/repositories/request-categorization.repository.interface';

export class DeleteAllRequestCategorizationsUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(): Promise<void> {
    await this.repository.deleteAll();
  }
}
