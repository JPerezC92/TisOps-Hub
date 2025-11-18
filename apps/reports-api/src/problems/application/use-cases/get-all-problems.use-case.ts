import type { IProblemsRepository } from '@problems/domain/repositories/problems.repository.interface';
import type { Problem } from '@repo/database';

export class GetAllProblemsUseCase {
  constructor(private readonly repository: IProblemsRepository) {}

  async execute(): Promise<{ data: Problem[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.countAll(),
    ]);

    return { data, total };
  }
}
