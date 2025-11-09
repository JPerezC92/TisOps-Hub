import { RequestTag } from '@request-tags/domain/entities/request-tag.entity';
import { IRequestTagRepository, RequestTagData } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class CreateRequestTagUseCase {
  constructor(private readonly repository: IRequestTagRepository) {}

  async execute(data: RequestTagData): Promise<RequestTag> {
    // Check if request already exists
    const existing = await this.repository.findByRequestId(data.requestId);
    if (existing) {
      throw new Error(`Request ID ${data.requestId} already exists`);
    }

    return this.repository.create(data);
  }
}
