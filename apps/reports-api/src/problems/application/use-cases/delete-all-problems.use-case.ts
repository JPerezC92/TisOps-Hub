import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';

export class DeleteAllProblemsUseCase {
  constructor(private readonly repository: IProblemsRepository) {}

  async execute(): Promise<{ message: string; deleted: number }> {
    const deleted = await this.repository.deleteAll();

    return {
      message: 'All problem records deleted successfully',
      deleted,
    };
  }
}
