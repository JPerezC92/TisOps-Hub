import { IRep01TagRepository } from '../../domain/repositories/rep01-tag.repository.interface';

export class GetRequestIdsByAdditionalInfoUseCase {
  constructor(private readonly rep01TagRepository: IRep01TagRepository) {}

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
