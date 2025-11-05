import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';

export class GetStatsUseCase {
  constructor(
    private readonly repository: IParentChildRequestRepository,
  ) {}

  async execute(): Promise<{
    totalRecords: number;
    uniqueParents: number;
    topParents: Array<{ parentId: string; childCount: number; link: string | null }>;
  }> {
    return this.repository.getStats();
  }
}
