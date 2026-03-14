import type { ErrorLog as DbErrorLog } from '@repo/database';
import { ErrorLog } from '@error-logs/domain/entities/error-log.entity';

export class ErrorLogAdapter {
  static toDomain(data: DbErrorLog): ErrorLog {
    return new ErrorLog({
      id: data.id,
      timestamp: data.timestamp,
      errorType: data.errorType,
      errorMessage: data.errorMessage,
      stackTrace: data.stackTrace ?? undefined,
      endpoint: data.endpoint ?? undefined,
      method: data.method ?? undefined,
      userId: data.userId ?? undefined,
      metadata: data.metadata ? JSON.parse(data.metadata) : undefined,
    });
  }
}
