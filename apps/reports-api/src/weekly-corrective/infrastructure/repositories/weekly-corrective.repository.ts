import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, weeklyCorrectives, InsertWeeklyCorrective, applicationRegistry, applicationPatterns, correctiveStatusRegistry } from '@repo/database';
import { eq, sql } from 'drizzle-orm';
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
    // Query all records with application mapping (LEFT JOIN to get registered app name)
    const queryResults = await this.db
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

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<string>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.weeklyCorrective.requestId)) return false;
      seenIds.add(r.weeklyCorrective.requestId);
      return true;
    });

    // Filter by app if provided
    let filteredResults = uniqueResults;
    if (app && app !== 'all') {
      filteredResults = uniqueResults.filter(
        (r) => r.registeredAppCode === app,
      );
    }

    // Filter by month if provided (format: YYYY-MM)
    let monthName = 'All Time';
    if (month) {
      filteredResults = filteredResults.filter((result) => {
        try {
          const createdDate = DateTime.fromFormat(
            result.weeklyCorrective.createdTime,
            'dd/MM/yyyy HH:mm',
          );
          if (!createdDate.isValid) return false;
          const recordMonth = createdDate.toFormat('yyyy-MM');
          return recordMonth === month;
        } catch {
          return false;
        }
      });

      // Format month name (e.g., "November 2024")
      const monthDate = DateTime.fromFormat(month, 'yyyy-MM');
      if (monthDate.isValid) {
        monthName = monthDate.toFormat('LLLL yyyy');
      }
    }

    // Get status mappings from corrective_status_registry
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

    // Collect all unique display statuses (mapped or raw if unmapped)
    const allStatusColumns = new Set<string>();

    // Group by registered application name and count by status
    const appMap = new Map<string, Map<string, number>>();

    for (const result of filteredResults) {
      const record = result.weeklyCorrective;
      // Use registered app name if available, otherwise "Unknown"
      const application = result.registeredAppName || 'Unknown';
      const rawStatus = record.requestStatus || 'Unknown';
      const rawPriority = record.priority || 'Unknown';

      // Use mapped display status or raw status if unmapped
      let displayStatus = statusMap.get(rawStatus) || rawStatus;

      // For "In Backlog", split by priority
      if (displayStatus === CorrectiveStatus.InBacklog) {
        const englishPriority = priorityMap[rawPriority] || rawPriority;
        displayStatus = `${CorrectiveStatus.InBacklog} (${englishPriority})`;
      }

      allStatusColumns.add(displayStatus);

      if (!appMap.has(application)) {
        appMap.set(application, new Map());
      }

      const statusCounts = appMap.get(application)!;
      statusCounts.set(displayStatus, (statusCounts.get(displayStatus) || 0) + 1);
    }

    // Build result array with fixed columns for "In Backlog" priorities
    // Always include all In Backlog priority columns, even if empty
    const fixedInBacklogColumns = [
      InBacklogByPriority.Critical,
      InBacklogByPriority.High,
      InBacklogByPriority.Medium,
      InBacklogByPriority.Low,
    ];

    // Add fixed columns to the set
    for (const col of fixedInBacklogColumns) {
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
