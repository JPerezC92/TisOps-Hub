import type { CorrectiveStatusRegistry } from '@repo/database';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

export class CorrectiveStatusAdapter {
  static toDomain(record: CorrectiveStatusRegistry): CorrectiveStatus {
    return new CorrectiveStatus(
      record.id,
      record.rawStatus,
      record.displayStatus,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
