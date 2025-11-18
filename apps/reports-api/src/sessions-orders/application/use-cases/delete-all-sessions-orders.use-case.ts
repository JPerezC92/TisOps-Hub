import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

export class DeleteAllSessionsOrdersUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(): Promise<{
    message: string;
    deletedMain: number;
    deletedReleases: number;
  }> {
    const [deletedMain, deletedReleases] = await Promise.all([
      this.repository.deleteAllMain(),
      this.repository.deleteAllReleases(),
    ]);

    return {
      message: 'All sessions/orders records deleted successfully',
      deletedMain,
      deletedReleases,
    };
  }
}
