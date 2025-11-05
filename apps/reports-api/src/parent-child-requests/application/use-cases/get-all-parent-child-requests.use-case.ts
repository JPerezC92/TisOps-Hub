import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

export class GetAllParentChildRequestsUseCase {
  constructor(
    private readonly repository: IParentChildRequestRepository,
  ) {}

  async execute(
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: ParentChildRequest[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(limit, offset),
      this.repository.countAll(),
    ]);

    return { data, total };
  }
}
