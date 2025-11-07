import { IRequestCategorizationRepository } from '../../domain/repositories/request-categorization.repository.interface';
import { RequestCategorizationEntity } from '../../domain/entities/request-categorization.entity';

/**
 * Use case for upserting (insert or update) multiple request categorizations
 * This allows uploading reports multiple times and updating existing records
 * instead of deleting and recreating them.
 */
export class UpsertManyRequestCategorizationsUseCase {
  constructor(
    private readonly repository: IRequestCategorizationRepository,
  ) {}

  async execute(
    entities: RequestCategorizationEntity[],
  ): Promise<{ created: number; updated: number }> {
    return this.repository.upsertMany(entities);
  }
}
