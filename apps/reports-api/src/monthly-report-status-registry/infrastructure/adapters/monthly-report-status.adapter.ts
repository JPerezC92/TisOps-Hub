import type { MonthlyReportStatusRegistry } from '@repo/database';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

export class MonthlyReportStatusAdapter {
  static toDomain(record: MonthlyReportStatusRegistry): MonthlyReportStatus {
    return new MonthlyReportStatus(
      record.id,
      record.rawStatus,
      record.displayStatus,
      record.isActive,
      record.createdAt,
      record.updatedAt,
    );
  }
}
