import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { errorLogs } from '@repo/database';
import { ErrorLog } from '../../domain/entities/error-log.entity';
import { IErrorLogRepository } from '../../domain/repositories/error-log.repository.interface';

@Injectable()
export class ErrorLogRepository implements IErrorLogRepository {
  constructor(private readonly db: LibSQLDatabase) {}

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

    return this.mapToEntity(result);
  }

  async findAll(limit = 100): Promise<ErrorLog[]> {
    const results = await this.db
      .select()
      .from(errorLogs)
      .orderBy(desc(errorLogs.timestamp))
      .limit(limit);

    return results.map((result) => this.mapToEntity(result));
  }

  async findById(id: number): Promise<ErrorLog | null> {
    const [result] = await this.db
      .select()
      .from(errorLogs)
      .where(eq(errorLogs.id, id));

    return result ? this.mapToEntity(result) : null;
  }

  private mapToEntity(data: typeof errorLogs.$inferSelect): ErrorLog {
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
