import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

export class DeleteAllWeeklyCorrectivesUseCase {
  constructor(private readonly repository: IWeeklyCorrectiveRepository) {}

  async execute(): Promise<{ message: string; deleted: number }> {
    const deleted = await this.repository.deleteAll();

    return {
      message: 'All weekly corrective records deleted successfully',
      deleted,
    };
  }
}
