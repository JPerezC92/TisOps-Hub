import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';

export class GetAllRequestCategorizationsWithAdditionalInfoUseCase {
  constructor(
    private readonly requestCategorizationRepository: IRequestCategorizationRepository,
  ) {}

  async execute(): Promise<
    Array<{
      requestId: string;
      category: string;
      technician: string;
      createdTime: string;
      modulo: string;
      subject: string;
      problemId: string;
      linkedRequestId: string;
      requestIdLink?: string;
      linkedRequestIdLink?: string;
      additionalInformation: string[];
      tagCategorizacion: string[];
    }>
  > {
    // Single query with LEFT JOIN - fetches all categorizations with their additional info
    return this.requestCategorizationRepository.findAllWithAdditionalInfo();
  }
}

