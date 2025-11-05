import { RequestCategorizationEntity } from '../entities/request-categorization.entity';

export const REQUEST_CATEGORIZATION_REPOSITORY = Symbol(
  'REQUEST_CATEGORIZATION_REPOSITORY',
);

export interface IRequestCategorizationRepository {
  findAll(): Promise<RequestCategorizationEntity[]>;
  findByCategory(category: string): Promise<RequestCategorizationEntity[]>;
  create(
    entity: RequestCategorizationEntity,
  ): Promise<RequestCategorizationEntity>;
  createMany(
    entities: RequestCategorizationEntity[],
  ): Promise<RequestCategorizationEntity[]>;
  deleteAll(): Promise<void>;
  getCategorySummary(): Promise<Array<{ category: string; count: number }>>;
}
