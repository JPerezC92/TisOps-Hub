import type { CategorizationRegistry } from '@repo/database';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';

export class CategorizationAdapter {
  static toDomain(record: CategorizationRegistry): Categorization {
    return new Categorization(
      record.id,
      record.sourceValue,
      record.displayValue,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
