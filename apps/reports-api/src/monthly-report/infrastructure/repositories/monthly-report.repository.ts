import { Injectable } from '@nestjs/common';
import { db, monthlyReports, InsertMonthlyReport } from '@repo/database';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class MonthlyReportRepository implements IMonthlyReportRepository {
  async findAll() {
    return db.select().from(monthlyReports).all();
  }

  async countAll(): Promise<number> {
    const records = await db.select().from(monthlyReports).all();
    return records.length;
  }

  async bulkCreate(records: InsertMonthlyReport[]): Promise<void> {
    // Batch insert for performance (tested: batch size 5 = 9.9 records/sec)
    const batchSize = 5;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      try {
        await db.insert(monthlyReports).values(batch).execute();
      } catch (error) {
        // If batch fails, try one by one
        for (const record of batch) {
          try {
            await db.insert(monthlyReports).values(record).execute();
          } catch (err) {
            // Skip failed records
          }
        }
      }
    }
  }

  async deleteAll(): Promise<number> {
    const result = await db.delete(monthlyReports).execute();
    return result.rowsAffected || 0;
  }
}
