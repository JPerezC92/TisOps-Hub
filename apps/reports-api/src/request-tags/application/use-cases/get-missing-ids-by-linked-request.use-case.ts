import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class GetMissingIdsByLinkedRequestUseCase {
  constructor(private readonly requestTagRepository: IRequestTagRepository) {}

  async execute(linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    if (!linkedRequestId || linkedRequestId.trim() === '') {
      return [];
    }

    return this.requestTagRepository.findMissingIdsByLinkedRequestId(linkedRequestId);
  }
}
