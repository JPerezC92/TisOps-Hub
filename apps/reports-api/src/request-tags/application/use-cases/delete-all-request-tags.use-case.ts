import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class DeleteAllRequestTagsUseCase {
  constructor(private readonly repository: IRequestTagRepository) {}

  async execute(): Promise<{ deleted: number }> {
    const count = await this.repository.count();
    await this.repository.deleteAll();
    return { deleted: count };
  }
}
