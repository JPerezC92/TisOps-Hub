import { eq, desc } from 'drizzle-orm';
import { Database, errorLogs } from '@repo/database';
import { ErrorLog } from '@error-logs/domain/entities/error-log.entity';
import { IErrorLogRepository } from '@error-logs/domain/repositories/error-log.repository.interface';
import { ErrorLogAdapter } from '@error-logs/infrastructure/adapters/error-log.adapter';

export class ErrorLogRepository implements IErrorLogRepository {
  constructor(private readonly db: Database) {}

  async create(errorLog: ErrorLog): Promise<ErrorLog> {
    const [result] = await this.db
      .insert(errorLogs)
      .values({
        timestamp: errorLog.timestamp,
        errorType: errorLog.errorType,
        errorMessage: errorLog.errorMessage,
        stackTrace: errorLog.stackTrace,
        endpoint: errorLog.endpoint,
        method: errorLog.method,
        userId: errorLog.userId,
        metadata: errorLog.metadata
          ? JSON.stringify(errorLog.metadata)
          : null,
      })
      .returning();

    return ErrorLogAdapter.toDomain(result);
  }

  async findAll(limit = 100): Promise<ErrorLog[]> {
    const results = await this.db
      .select()
      .from(errorLogs)
      .orderBy(desc(errorLogs.timestamp))
      .limit(limit);

    return results.map(ErrorLogAdapter.toDomain);
  }

  async findById(id: number): Promise<ErrorLog | null> {
    const [result] = await this.db
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.id, id));

    return result ? ErrorLogAdapter.toDomain(result) : null;
  }
}
