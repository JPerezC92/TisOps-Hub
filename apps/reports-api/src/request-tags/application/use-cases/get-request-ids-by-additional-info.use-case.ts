import { IRequestTagRepository } from '@request-tags/domain/repositories/request-tag.repository.interface';

export class GetRequestIdsByAdditionalInfoUseCase {
  constructor(private readonly requestTagRepository: IRequestTagRepository) {}

  async execute(informacionAdicional: string, linkedRequestId: string): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    if (!informacionAdicional || informacionAdicional.trim() === '') {
      return [];
    }

    if (!linkedRequestId || linkedRequestId.trim() === '') {
      return [];
    }

    return this.requestTagRepository.findRequestIdsByAdditionalInfo(informacionAdicional, linkedRequestId);
  }
}
