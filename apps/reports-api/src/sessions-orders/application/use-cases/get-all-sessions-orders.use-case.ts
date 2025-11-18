import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';
import type { SessionsOrder, SessionsOrdersRelease } from '@repo/database';

export class GetAllSessionsOrdersUseCase {
  constructor(private readonly repository: ISessionsOrdersRepository) {}

  async execute(): Promise<{
    data: SessionsOrder[];
    releases: SessionsOrdersRelease[];
    total: number;
    totalReleases: number;
  }> {
    const [data, releases, total, totalReleases] = await Promise.all([
      this.repository.findAllMain(),
      this.repository.findAllReleases(),
      this.repository.countMain(),
      this.repository.countReleases(),
    ]);

    return { data, releases, total, totalReleases };
  }
}
