import { Injectable } from '@nestjs/common';
import { GetAllParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/get-all-parent-child-requests.use-case';
import { GetChildrenByParentUseCase } from '@parent-child-requests/application/use-cases/get-children-by-parent.use-case';
import { GetStatsUseCase } from '@parent-child-requests/application/use-cases/get-stats.use-case';
import { CreateManyParentChildRequestsUseCase } from '@parent-child-requests/application/use-cases/create-many.use-case';
import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

@Injectable()
export class ParentChildRequestsService {
  constructor(
    private readonly getAllParentChildRequestsUseCase: GetAllParentChildRequestsUseCase,
    private readonly getChildrenByParentUseCase: GetChildrenByParentUseCase,
    private readonly getStatsUseCase: GetStatsUseCase,
    private readonly createManyParentChildRequestsUseCase: CreateManyParentChildRequestsUseCase,
  ) {}

  async findAll(
    limit?: number,
    offset?: number,
  ): Promise<{ data: ParentChildRequest[]; total: number }> {
    return this.getAllParentChildRequestsUseCase.execute(limit, offset);
  }

  async findChildrenByParent(parentId: string): Promise<ParentChildRequest[]> {
    return this.getChildrenByParentUseCase.execute(parentId);
  }

  async getStats(): Promise<{
    totalRecords: number;
    uniqueParents: number;
    topParents: Array<{ parentId: string; childCount: number; link: string | null }>;
  }> {
    return this.getStatsUseCase.execute();
  }

  async importFromExcel(
    data: Array<{ requestId: string; linkedRequestId: string }>,
  ): Promise<{ imported: number; skipped: number }> {
    return this.createManyParentChildRequestsUseCase.execute(data);
  }
}
