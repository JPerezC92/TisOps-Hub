import { Injectable } from '@nestjs/common';
import { db, weeklyCorrectives, InsertWeeklyCorrective } from '@repo/database';
import type { IWeeklyCorrectiveRepository } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

@Injectable()
export class WeeklyCorrectiveRepository implements IWeeklyCorrectiveRepository {
  async findAll() {
    return db.select().from(weeklyCorrectives).all();
  }

  async countAll(): Promise<number> {
    const records = await db.select().from(weeklyCorrectives).all();
    return records.length;
  }

  async bulkCreate(records: InsertWeeklyCorrective[]): Promise<void> {
    // Batch insert for performance (tested: batch size 50 = 108 records/sec)
    const batchSize = 50;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await db.insert(weeklyCorrectives).values(batch).execute();
    }
  }

  async deleteAll(): Promise<number> {
    const result = await db.delete(weeklyCorrectives).execute();
    return result.rowsAffected || 0;
  }
}
