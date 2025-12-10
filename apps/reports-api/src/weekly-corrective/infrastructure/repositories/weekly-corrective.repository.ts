import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, weeklyCorrectives, InsertWeeklyCorrective, applicationRegistry, applicationPatterns, correctiveStatusRegistry, monthlyReports } from '@repo/database';
import { eq, sql, and } from 'drizzle-orm';
import { DateTime } from 'luxon';
import {
  CorrectiveStatus,
  InBacklogByPriority,
  L3TicketsStatusColumns,
  Priority,
  PrioritySpanish,
} from '@repo/reports';
import type { IWeeklyCorrectiveRepository, L3TicketsByStatusResult, L3TicketsByStatusRow } from '@weekly-corrective/domain/repositories/weekly-corrective.repository.interface';

@Injectable()
export class WeeklyCorrectiveRepository implements IWeeklyCorrectiveRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll() {
    return this.db.select().from(weeklyCorrectives).all();
  }

  async countAll(): Promise<number> {
    const records = await this.db.select().from(weeklyCorrectives).all();
    return records.length;
  }

  async bulkCreate(records: InsertWeeklyCorrective[]): Promise<void> {
    // Batch insert for performance (tested: batch size 50 = 108 records/sec)
    const batchSize = 50;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.db.insert(weeklyCorrectives).values(batch).execute();
    }
  }

  async deleteAll(): Promise<number> {
    const result = await this.db.delete(weeklyCorrectives).execute();
    return result.rowsAffected || 0;
  }

  async findL3TicketsByStatus(
    app?: string,
    month?: string,
  ): Promise<L3TicketsByStatusResult> {
    // ===== 1. Query weekly_correctives (all records are L3) =====
    const weeklyResults = await this.db
      .select({
        weeklyCorrective: weeklyCorrectives,
        registeredAppName: applicationRegistry.name,
        registeredAppCode: applicationRegistry.code,
      })
      .from(weeklyCorrectives)
      .leftJoin(
        applicationPatterns,
        sql`LOWER(${weeklyCorrectives.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
      )
      .leftJoin(
        applicationRegistry,
        eq(applicationPatterns.applicationId, applicationRegistry.id),
      )
      .all();

    // Deduplicate weekly_correctives by requestId
    const seenWeeklyIds = new Set<string>();
    const uniqueWeeklyResults = weeklyResults.filter((r) => {
      if (seenWeeklyIds.has(r.weeklyCorrective.requestId)) return false;
      seenWeeklyIds.add(r.weeklyCorrective.requestId);
      return true;
    });

    // ===== 2. Query monthly_reports (only Nivel 3 records) =====
    const monthlyResults = await this.db
      .select({
        monthlyReport: monthlyReports,
        registeredAppName: applicationRegistry.name,
        registeredAppCode: applicationRegistry.code,
      })
      .from(monthlyReports)
      .leftJoin(
        applicationPatterns,
        sql`LOWER(${monthlyReports.aplicativos}) LIKE '%' || LOWER(${applicationPatterns.pattern}) || '%'`,
      )
      .leftJoin(
        applicationRegistry,
        eq(applicationPatterns.applicationId, applicationRegistry.id),
      )
      .where(eq(monthlyReports.requestStatus, 'Nivel 3'))
      .all();

    // Deduplicate monthly_reports by requestId
    const seenMonthlyIds = new Set<number>();
    const uniqueMonthlyResults = monthlyResults.filter((r) => {
      if (seenMonthlyIds.has(r.monthlyReport.requestId)) return false;
      seenMonthlyIds.add(r.monthlyReport.requestId);
      return true;
    });

    // ===== 3. Normalize both sources to common format =====
    interface NormalizedRecord {
      requestId: string;
      rawStatus: string;
      priority: string;
      application: string;
      appCode: string | null;
      createdTime: DateTime | null;
      source: 'weekly' | 'monthly';
    }

    const normalizedWeekly: NormalizedRecord[] = uniqueWeeklyResults.map((r) => {
      let createdTime: DateTime | null = null;
      try {
        createdTime = DateTime.fromFormat(r.weeklyCorrective.createdTime, 'dd/MM/yyyy HH:mm');
        if (!createdTime.isValid) createdTime = null;
      } catch {
        createdTime = null;
      }
      return {
        requestId: r.weeklyCorrective.requestId,
        rawStatus: r.weeklyCorrective.requestStatus || 'Unknown',
        priority: r.weeklyCorrective.priority || 'Unknown',
        application: r.registeredAppName || 'Unknown',
        appCode: r.registeredAppCode,
        createdTime,
        source: 'weekly' as const,
      };
    });

    const normalizedMonthly: NormalizedRecord[] = uniqueMonthlyResults.map((r) => {
      let createdTime: DateTime | null = null;
      try {
        // monthly_reports.createdTime is a timestamp (Date object)
        if (r.monthlyReport.createdTime) {
          createdTime = DateTime.fromJSDate(r.monthlyReport.createdTime);
          if (!createdTime.isValid) createdTime = null;
        }
      } catch {
        createdTime = null;
      }
      return {
        requestId: String(r.monthlyReport.requestId),
        rawStatus: r.monthlyReport.requestStatus || 'Unknown',
        priority: r.monthlyReport.priority || 'Unknown', // Already in English
        application: r.registeredAppName || 'Unknown',
        appCode: r.registeredAppCode,
        createdTime,
        source: 'monthly' as const,
      };
    });

    // ===== 4. Merge with deduplication (weekly takes precedence) =====
    const seenIds = new Set<string>();
    const mergedResults: NormalizedRecord[] = [];

    // Add weekly first (takes precedence)
    for (const record of normalizedWeekly) {
      if (!seenIds.has(record.requestId)) {
        seenIds.add(record.requestId);
        mergedResults.push(record);
      }
    }

    // Add monthly (only if not already seen)
    for (const record of normalizedMonthly) {
      if (!seenIds.has(record.requestId)) {
        seenIds.add(record.requestId);
        mergedResults.push(record);
      }
    }

    // ===== 5. Filter by app if provided =====
    let filteredResults = mergedResults;
    if (app && app !== 'all') {
      filteredResults = mergedResults.filter((r) => r.appCode === app);
    }

    // ===== 6. Filter by month if provided (format: YYYY-MM) =====
    let monthName = 'All Time';
    if (month) {
      filteredResults = filteredResults.filter((record) => {
        if (!record.createdTime) return false;
        const recordMonth = record.createdTime.toFormat('yyyy-MM');
        return recordMonth === month;
      });

      // Format month name (e.g., "November 2024")
      const monthDate = DateTime.fromFormat(month, 'yyyy-MM');
      if (monthDate.isValid) {
        monthName = monthDate.toFormat('LLLL yyyy');
      }
    }

    // ===== 7. Get status mappings from corrective_status_registry =====
    const statusMappings = await this.db
      .select({
        rawStatus: correctiveStatusRegistry.rawStatus,
        displayStatus: correctiveStatusRegistry.displayStatus,
      })
      .from(correctiveStatusRegistry)
      .all();

    const statusMap = new Map(
      statusMappings.map((r) => [r.rawStatus, r.displayStatus]),
    );

    // Map Spanish priority to English
    const priorityMap: Record<string, string> = {
      [PrioritySpanish.Critica]: Priority.Critical,
      'Critica': Priority.Critical, // Without accent
      [PrioritySpanish.Alta]: Priority.High,
      [PrioritySpanish.Media]: Priority.Medium,
      [PrioritySpanish.Baja]: Priority.Low,
    };

    // ===== 8. Group by application and count by status =====
    const allStatusColumns = new Set<string>();
    const appMap = new Map<string, Map<string, number>>();

    for (const record of filteredResults) {
      const application = record.application;
      const rawStatus = record.rawStatus;
      const rawPriority = record.priority;

      // Use mapped display status or default to "In Backlog" for monthly Nivel 3
      let displayStatus = statusMap.get(rawStatus);

      // For monthly_reports with "Nivel 3", default to "In Backlog"
      if (!displayStatus && record.source === 'monthly' && rawStatus === 'Nivel 3') {
        displayStatus = CorrectiveStatus.InBacklog;
      }

      // Fallback to raw status if still unmapped
      if (!displayStatus) {
        displayStatus = rawStatus;
      }

      // For "In Backlog", split by priority
      if (displayStatus === CorrectiveStatus.InBacklog) {
        // Priority from monthly is already in English, from weekly needs mapping
        const englishPriority = record.source === 'weekly'
          ? (priorityMap[rawPriority] || rawPriority)
          : rawPriority;
        displayStatus = `${CorrectiveStatus.InBacklog} (${englishPriority})`;
      }

      allStatusColumns.add(displayStatus);

      if (!appMap.has(application)) {
        appMap.set(application, new Map());
      }

      const statusCounts = appMap.get(application)!;
      statusCounts.set(displayStatus, (statusCounts.get(displayStatus) || 0) + 1);
    }

    // Build result array with all fixed L3 status columns
    // Always include all columns, even if empty
    for (const col of L3TicketsStatusColumns) {
      allStatusColumns.add(col);
    }

    // Define sort order using enum
    const statusOrder: string[] = [...L3TicketsStatusColumns];
    const statusColumns = Array.from(allStatusColumns).sort((a, b) => {
      const indexA = statusOrder.indexOf(a);
      const indexB = statusOrder.indexOf(b);
      // Known statuses come first in defined order, unknown ones at the end alphabetically
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
    const data: L3TicketsByStatusRow[] = [];

    for (const [application, statusCounts] of appMap) {
      const countsObj: Record<string, number> = {};
      let total = 0;

      for (const status of statusColumns) {
        const count = statusCounts.get(status) || 0;
        countsObj[status] = count;
        total += count;
      }

      data.push({
        application,
        statusCounts: countsObj,
        total,
      });
    }

    // Sort by total descending
    data.sort((a, b) => b.total - a.total);

    const totalL3Tickets = filteredResults.length;

    return { data, statusColumns, monthName, totalL3Tickets };
  }
}
