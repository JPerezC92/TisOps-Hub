import { Injectable, Inject } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Database, DATABASE_CONNECTION, sessionsOrders, sessionsOrdersReleases, SessionsOrder, SessionsOrdersRelease, InsertSessionsOrder, InsertSessionsOrdersRelease } from '@repo/database';
import type { ISessionsOrdersRepository, SessionsOrdersLast30DaysResult, SessionsOrdersLast30DaysRow, IncidentsVsOrdersByMonthResult, IncidentsVsOrdersByMonthRow } from '@sessions-orders/domain/repositories/sessions-orders.repository.interface';

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

  async findLast30Days(): Promise<SessionsOrdersLast30DaysResult> {
    const allRecords = await this.db.select().from(sessionsOrders).all();

    if (allRecords.length === 0) {
      return { data: [] };
    }

    // Sort by dia (Unix timestamp) descending - most recent first
    const sortedRecords = [...allRecords].sort((a, b) => b.dia - a.dia);

    // Take top 30 most recent, then reverse for ascending display
    const top30 = sortedRecords.slice(0, 30).reverse();

    // Transform to response format
    const data: SessionsOrdersLast30DaysRow[] = top30.map((record) => {
      const date = DateTime.fromMillis(record.dia);
      return {
        day: `Day ${date.day}`,
        date: date.toFormat('yyyy-MM-dd'),
        incidents: record.incidentes,
        sessions: record.sessions,
        placedOrders: record.placedOrders,
      };
    });

    return { data };
  }

  async findIncidentsVsOrdersByMonth(year?: number): Promise<IncidentsVsOrdersByMonthResult> {
    let allRecords = await this.db.select().from(sessionsOrders).all();

    // Filter by year if provided
    if (year) {
      allRecords = allRecords.filter(record => record.ano === year);
    }

    // Group by month and aggregate
    const monthMap = new Map<number, { incidents: number; placedOrders: number }>();

    for (const record of allRecords) {
      const month = record.mes;
      if (!monthMap.has(month)) {
        monthMap.set(month, { incidents: 0, placedOrders: 0 });
      }
      const data = monthMap.get(month)!;
      data.incidents += record.incidentes;
      data.placedOrders += record.placedOrders;
    }

    // Month names in English
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Convert to array and sort by month
    const data: IncidentsVsOrdersByMonthRow[] = Array.from(monthMap.entries())
      .map(([monthNum, values]) => ({
        month: monthNames[monthNum - 1],
        monthNumber: monthNum,
        incidents: values.incidents,
        placedOrders: values.placedOrders,
      }))
      .sort((a, b) => a.monthNumber - b.monthNumber);

    return { data };
  }
}
