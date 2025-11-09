import { RequestTag } from '@request-tags/domain/entities/request-tag.entity';
import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class GetAllRequestTagsUseCase {
  constructor(private readonly repository: IRequestTagRepository) {}

  async execute(): Promise<RequestTag[]> {
    return this.repository.findAll();
  }
}
