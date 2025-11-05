import { IParentChildRequestRepository } from '@parent-child-requests/domain/repositories/parent-child-request.repository.interface';
import { ParentChildRequest } from '@parent-child-requests/domain/entities/parent-child-request.entity';

export class GetChildrenByParentUseCase {
  constructor(
    private readonly repository: IParentChildRequestRepository,
  ) {}

  async execute(parentId: string): Promise<ParentChildRequest[]> {
    return this.repository.findByParentId(parentId);
  }
}
