import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';

export class DeleteAllParentChildRequestsUseCase {
  constructor(
    private readonly repository: IParentChildRequestRepository,
  ) {}

  /**
   * Deletes all parent-child request relationships from the database.
   * 
   * ⚠️ WARNING: This operation removes ALL existing data.
   * 
   * @returns void
   */
  async execute(): Promise<void> {
    await this.repository.deleteAll();
  }
}
