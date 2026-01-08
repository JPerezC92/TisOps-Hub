import { RequestTag } from '@request-tags/domain/entities/request-tag.entity';
import { RequestTagAlreadyExistsError } from '@request-tags/domain/errors/request-tag-already-exists.error';
import { IRequestTagRepository, RequestTagData } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class CreateRequestTagUseCase {
  constructor(private readonly repository: IRequestTagRepository) {}

  async execute(data: RequestTagData): Promise<RequestTag | RequestTagAlreadyExistsError> {
    const existing = await this.repository.findByRequestId(data.requestId);
    if (existing) {
      return new RequestTagAlreadyExistsError(data.requestId);
    }

    return this.repository.create(data);
  }
}
