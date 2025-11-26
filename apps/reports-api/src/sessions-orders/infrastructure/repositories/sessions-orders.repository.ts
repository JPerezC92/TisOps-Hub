import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, sessionsOrders, sessionsOrdersReleases, SessionsOrder, SessionsOrdersRelease, InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';
import type { ISessionsOrdersRepository } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

@Injectable()
export class SessionsOrdersRepository implements ISessionsOrdersRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAllMain(): Promise<SessionsOrder[]> {
    return this.db.select().from(sessionsOrders).all();
  }

  async findAllReleases(): Promise<SessionsOrdersRelease[]> {
    return this.db.select().from(sessionsOrdersReleases).all();
  }

  async countMain(): Promise<number> {
    const result = await this.db.select().from(sessionsOrders).all();
    return result.length;
  }

  async countReleases(): Promise<number> {
    const result = await this.db.select().from(sessionsOrdersReleases).all();
    return result.length;
  }

  async bulkCreateMain(records: InsertSessionsOrder[]): Promise<void> {
    if (records.length === 0) return;

    // Batch size 150 (tested optimal: 605.6 records/sec)
    const batchSize = 150;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.db.insert(sessionsOrders).values(batch).execute();
    }
  }

  async bulkCreateReleases(records: InsertSessionsOrdersRelease[]): Promise<void> {
    if (records.length === 0) return;

    // Batch size 150 (tested optimal: 605.6 records/sec)
    const batchSize = 150;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.db.insert(sessionsOrdersReleases).values(batch).execute();
    }
  }

  async deleteAllMain(): Promise<number> {
    const result = await this.db.delete(sessionsOrders).execute();
    return result.rowsAffected || 0;
  }

  async deleteAllReleases(): Promise<number> {
    const result = await this.db.delete(sessionsOrdersReleases).execute();
    return result.rowsAffected || 0;
  }
}
