import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, monthlyReports, InsertMonthlyReport, applicationRegistry, applicationPatterns, MonthlyReport } from '@repo/database';
import { and, eq, sql } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { Priority } from '@repo/reports';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class MonthlyReportRepository implements IMonthlyReportRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll() {
    return this.db.select().from(monthlyReports).all();
  }

  async countAll(): Promise<number> {
    const records = await this.db.select().from(monthlyReports).all();
    return records.length;
  }

  async bulkCreate(records: InsertMonthlyReport[]): Promise<void> {
    // Batch insert for performance (tested: batch size 5 = 9.9 records/sec)
    const batchSize = 5;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      try {
        await this.db.insert(monthlyReports).values(batch).execute();
      } catch (error) {
        // If batch fails, try one by one
        for (const record of batch) {
          try {
            await this.db.insert(monthlyReports).values(record).execute();
          } catch (err) {
            // Skip failed records
          }
        }
      }
    }
  }

  async deleteAll(): Promise<number> {
    const result = await this.db.delete(monthlyReports).execute();
    return result.rowsAffected || 0;
  }

  async findCriticalIncidentsFiltered(app?: string, month?: string) {
    let records: MonthlyReport[];

    if (app && app !== 'all') {
      // Filter by application using JOIN with pattern matching
      const queryResults = await this.db
        .selectDistinct({ monthlyReport: monthlyReports })
        .from(monthlyReports)
        .leftJoin(
          applicationPatterns,
          sql`LOWER(${monthlyReports.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
        )
        .leftJoin(
          applicationRegistry,
          eq(applicationPatterns.applicationId, applicationRegistry.id),
        )
        .where(
          and(
            eq(monthlyReports.priority, Priority.Critical),
            eq(applicationRegistry.code, app),
          ),
        )
        .all();

      records = queryResults.map((r) => r.monthlyReport);
    } else {
      // Get all Critical priority records without app filter
      records = await this.db
        .select()
        .from(monthlyReports)
        .where(eq(monthlyReports.priority, Priority.Critical))
        .all();
    }

    // Filter by month if provided (format: YYYY-MM)
    if (month) {
      records = records.filter((record) => {
        try {
          // Parse createdTime format: "DD/MM/YYYY HH:mm"
          const createdDate = DateTime.fromFormat(
            record.createdTime,
            'dd/MM/yyyy HH:mm',
          );

          if (!createdDate.isValid) {
            return false;
          }

          // Compare with month filter (format: YYYY-MM)
          const recordMonth = createdDate.toFormat('yyyy-MM');
          return recordMonth === month;
        } catch {
          return false;
        }
      });
    }

    return records;
  }
}
