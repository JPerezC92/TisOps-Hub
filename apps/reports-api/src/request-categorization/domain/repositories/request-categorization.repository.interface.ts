import { RequestCategorizationEntity } from '@request-categorization/domain/entities/request-categorization.entity';

export const REQUEST_CATEGORIZATION_REPOSITORY = Symbol(
  'REQUEST_CATEGORIZATION_REPOSITORY',
);

export interface IRequestCategorizationRepository {
  findAll(): Promise<RequestCategorizationEntity[]>;
  findAllWithAdditionalInfo(): Promise<
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
  >;
  findByCategory(category: string): Promise<RequestCategorizationEntity[]>;
  create(
    entity: RequestCategorizationEntity,
  ): Promise<RequestCategorizationEntity>;
  createMany(
    entities: RequestCategorizationEntity[],
  ): Promise<RequestCategorizationEntity[]>;
  upsertMany(
    entities: RequestCategorizationEntity[],
  ): Promise<{ created: number; updated: number }>;
  findRequestIdsByCategorizacion(
    linkedRequestId: string,
    categorizacion: string,
  ): Promise<Array<{ requestId: string; requestIdLink?: string }>>;
  deleteAll(): Promise<void>;
  getCategorySummary(): Promise<Array<{ category: string; count: number }>>;
}
