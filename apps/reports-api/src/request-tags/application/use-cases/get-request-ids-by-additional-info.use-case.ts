import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class GetRequestIdsByAdditionalInfoUseCase {
  constructor(private readonly rep01TagRepository: IRequestTagRepository) {}

  async execute(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    if (!informacionAdicional || informacionAdicional.trim() === '') {
      return [];
    }

    if (!linkedRequestId || linkedRequestId.trim() === '') {
      return [];
    }

    return this.rep01TagRepository.findRequestIdsByAdditionalInfo(informacionAdicional, linkedRequestId);
  }
}
