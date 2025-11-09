import { IRequestTagRepository } from '../../domain/repositories/request-tag.repository.interface';

export class GetMissingIdsByLinkedRequestUseCase {
  constructor(private readonly rep01TagRepository: IRequestTagRepository) {}

  async execute(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    if (!linkedRequestId || linkedRequestId.trim() === '') {
      return [];
    }

    return this.rep01TagRepository.findMissingIdsByLinkedRequestId(linkedRequestId);
  }
}
