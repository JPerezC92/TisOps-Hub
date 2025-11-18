import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';
import type { WeeklyCorrective } from '@repo/database';

export class GetAllWeeklyCorrectivesUseCase {
  constructor(private readonly repository: IWeeklyCorrectiveRepository) {}

  async execute(): Promise<{ data: WeeklyCorrective[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.countAll(),
    ]);

    return { data, total };
  }
}
