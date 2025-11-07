import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';

export class GetRequestIdsByCategorizacionUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(
    linkedRequestId: string,
    categorizacion: string,
  ): Promise<Array<{ requestId: string; requestIdLink?: string }>> {
    return this.repository.findRequestIdsByCategorizacion(
      linkedRequestId,
      categorizacion,
    );
  }
}
