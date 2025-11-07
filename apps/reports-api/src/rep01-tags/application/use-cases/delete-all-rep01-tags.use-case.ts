import { IRep01TagRepository } from '../../domain/repositories/rep01-tag.repository.interface';

export class DeleteAllRep01TagsUseCase {
  constructor(private readonly repository: IRep01TagRepository) {}

  async execute(): Promise<{ deleted: number }> {
    const count = await this.repository.count();
    await this.repository.deleteAll();
    return { deleted: count };
  }
}
