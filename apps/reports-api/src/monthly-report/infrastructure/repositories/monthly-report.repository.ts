import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, monthlyReports, InsertMonthlyReport, applicationRegistry, applicationPatterns, MonthlyReport, parentChildRequests, monthlyReportStatusRegistry, categorizationRegistry, moduleRegistry } from '@repo/database';
import { and, eq, sql } from 'drizzle-orm';
import { DEFAULT_DISPLAY_STATUS, DisplayStatus, Recurrency, mapRecurrency } from '@repo/reports';
import { DateTime } from 'luxon';
import { Priority } from '@repo/reports';
import type {
  IMonthlyReportRepository,
  ModuleEvolutionResult,
  CategorizationDetail,
  TicketDetail,
  StabilityIndicatorsResult,
  StabilityIndicatorRow,
  UnmappedRequest,
  CategoryDistributionResult,
  CategoryDistributionRow,
  UnassignedRecurrencyRequest,
  BusinessFlowPriorityResult,
  PriorityBreakdown,
  ModuleCount,
  PriorityByAppResult,
  PriorityByAppRow,
  IncidentsByWeekResult,
  IncidentsByWeekRow,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

@Injectable()
export class MonthlyReportRepository implements IMonthlyReportRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findAll() {
    const results = await this.db
      .select({
        requestId: monthlyReports.requestId,
        requestIdLink: monthlyReports.requestIdLink,
        aplicativos: monthlyReports.aplicativos,
        categorizacion: monthlyReports.categorizacion,
        createdTime: monthlyReports.createdTime,
        requestStatus: monthlyReports.requestStatus,
        modulo: monthlyReports.modulo,
        subject: monthlyReports.subject,
        priority: monthlyReports.priority,
        eta: monthlyReports.eta,
        informacionAdicional: monthlyReports.informacionAdicional,
        resolvedTime: monthlyReports.resolvedTime,
        paisesAfectados: monthlyReports.paisesAfectados,
        recurrencia: monthlyReports.recurrencia,
        technician: monthlyReports.technician,
        jira: monthlyReports.jira,
        problemId: monthlyReports.problemId,
        linkedRequestId: monthlyReports.linkedRequestId,
        linkedRequestIdLink: monthlyReports.linkedRequestIdLink,
        requestOlaStatus: monthlyReports.requestOlaStatus,
        grupoEscalamiento: monthlyReports.grupoEscalamiento,
        aplicactivosAfectados: monthlyReports.aplicactivosAfectados,
        nivelUno: monthlyReports.nivelUno,
        campana: monthlyReports.campana,
        cuv: monthlyReports.cuv,
        release: monthlyReports.release,
        rca: monthlyReports.rca,
        displayStatus: sql<string>`COALESCE(${monthlyReportStatusRegistry.displayStatus}, ${DEFAULT_DISPLAY_STATUS})`.as('displayStatus'),
      })
      .from(monthlyReports)
      .leftJoin(
        monthlyReportStatusRegistry,
        eq(monthlyReports.requestStatus, monthlyReportStatusRegistry.rawStatus),
      )
      .all();

    return results;
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
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(record.createdTime);

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

  async findModuleEvolution(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ModuleEvolutionResult[]> {
    // Query with LEFT JOINs for module and categorization registry mappings
    const baseQuery = this.db
      .select({
        monthlyReport: monthlyReports,
        registeredAppCode: applicationRegistry.code,
        mappedModuleDisplayValue: moduleRegistry.displayValue,
        mappedCategoryDisplayValue: categorizationRegistry.displayValue,
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
      .leftJoin(
        moduleRegistry,
        and(
          eq(monthlyReports.modulo, moduleRegistry.sourceValue),
          eq(moduleRegistry.isActive, true),
        ),
      )
      .leftJoin(
        categorizationRegistry,
        and(
          eq(monthlyReports.categorizacion, categorizationRegistry.sourceValue),
          eq(categorizationRegistry.isActive, true),
        ),
      );

    let queryResults: {
      monthlyReport: MonthlyReport;
      registeredAppCode: string | null;
      mappedModuleDisplayValue: string | null;
      mappedCategoryDisplayValue: string | null;
    }[];

    if (app && app !== 'all') {
      queryResults = await baseQuery
        .where(eq(applicationRegistry.code, app))
        .all();
    } else {
      queryResults = await baseQuery.all();
    }

    // Deduplicate by requestId (JOINs can create duplicates)
    const seenRequestIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenRequestIds.has(r.monthlyReport.requestId)) {
        return false;
      }
      seenRequestIds.add(r.monthlyReport.requestId);
      return true;
    });

    // Filter by date range if provided
    let filteredResults = uniqueResults;
    if (startDate || endDate) {
      const start = startDate
        ? DateTime.fromISO(startDate).startOf('day')
        : null;
      const end = endDate ? DateTime.fromISO(endDate).endOf('day') : null;

      filteredResults = uniqueResults.filter((result) => {
        try {
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
          if (!createdDate.isValid) return false;

          if (start && createdDate < start) return false;
          if (end && createdDate > end) return false;
          return true;
        } catch {
          return false;
        }
      });
    }

    // Get linked ticket counts from parent_child_requests table
    const linkedCounts = await this.db
      .select({
        linkedRequestId: parentChildRequests.linkedRequestId,
        count: sql<number>`COUNT(*)`.as('count'),
      })
      .from(parentChildRequests)
      .groupBy(parentChildRequests.linkedRequestId)
      .all();

    const linkedCountMap = new Map(
      linkedCounts.map((r) => [r.linkedRequestId, r.count]),
    );

    // Get status mappings from request_status_registry table
    const statusMappings = await this.db
      .select({
        rawStatus: monthlyReportStatusRegistry.rawStatus,
        displayStatus: monthlyReportStatusRegistry.displayStatus,
      })
      .from(monthlyReportStatusRegistry)
      .all();

    const statusMap = new Map(
      statusMappings.map((r) => [r.rawStatus, r.displayStatus]),
    );

    // Store display mappings for modules and categorizations
    const moduleDisplayMap = new Map<string, string | null>();
    const categoryDisplayMap = new Map<string, string | null>();

    // Group by Module → Categorization (no subject grouping - individual tickets)
    const moduleMap = new Map<
      string,
      Map<string, TicketDetail[]>
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      const moduleSourceValue = record.modulo || 'Unknown';
      const categorySourceValue = record.categorizacion || 'Unknown';

      // Track display mappings
      if (!moduleDisplayMap.has(moduleSourceValue)) {
        moduleDisplayMap.set(moduleSourceValue, result.mappedModuleDisplayValue);
      }
      if (!categoryDisplayMap.has(categorySourceValue)) {
        categoryDisplayMap.set(categorySourceValue, result.mappedCategoryDisplayValue);
      }

      if (!moduleMap.has(moduleSourceValue)) {
        moduleMap.set(moduleSourceValue, new Map());
      }
      const catMap = moduleMap.get(moduleSourceValue)!;

      if (!catMap.has(categorySourceValue)) {
        catMap.set(categorySourceValue, []);
      }
      const ticketsList = catMap.get(categorySourceValue)!;

      // Get linked count from parent_child_requests table
      const parentId = record.linkedRequestId || '';
      const linkedCount = parentId ? (linkedCountMap.get(parentId) || 0) : 0;

      // Get mapped display status and check if it's unmapped
      const mappedStatus = statusMap.get(record.requestStatus);
      const displayStatus = mappedStatus || DEFAULT_DISPLAY_STATUS;
      const isUnmapped = !mappedStatus;

      ticketsList.push({
        subject: record.subject || 'Unknown',
        requestId: record.requestId,
        requestIdLink: record.requestIdLink ?? undefined,
        parentTicketId: parentId,
        linkedTicketsCount: linkedCount,
        additionalInfo: record.informacionAdicional || '',
        displayStatus: displayStatus,
        isUnmapped: isUnmapped,
      });
    }

    // Calculate totals and percentages
    const total = filteredResults.length;
    const results: ModuleEvolutionResult[] = [];

    for (const [moduleSourceValue, catMap] of moduleMap) {
      let moduleCount = 0;
      const categorizations: CategorizationDetail[] = [];

      for (const [categorySourceValue, tickets] of catMap) {
        const catCount = tickets.length;

        // Sort tickets by requestId descending (most recent first)
        tickets.sort((a, b) => b.requestId - a.requestId);

        moduleCount += catCount;
        categorizations.push({
          categorizationSourceValue: categorySourceValue,
          categorizationDisplayValue: categoryDisplayMap.get(categorySourceValue) || null,
          count: catCount,
          percentage:
            total > 0 ? Math.round((catCount / total) * 10000) / 100 : 0,
          tickets,
        });
      }

      // Sort categorizations by count descending
      categorizations.sort((a, b) => b.count - a.count);

      results.push({
        moduleSourceValue,
        moduleDisplayValue: moduleDisplayMap.get(moduleSourceValue) || null,
        count: moduleCount,
        percentage:
          total > 0 ? Math.round((moduleCount / total) * 10000) / 100 : 0,
        categorizations,
      });
    }

    // Sort modules by count descending
    results.sort((a, b) => b.count - a.count);

    return results;
  }

  async findStabilityIndicators(
    app?: string,
    month?: string,
  ): Promise<StabilityIndicatorsResult> {
    // Query all records with application mapping (LEFT JOIN to get registered app name)
    const queryResults = await this.db
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
      .all();

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.monthlyReport.requestId)) return false;
      seenIds.add(r.monthlyReport.requestId);
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
    if (month) {
      filteredResults = filteredResults.filter((result) => {
        try {
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
          if (!createdDate.isValid) return false;
          const recordMonth = createdDate.toFormat('yyyy-MM');
          return recordMonth === month;
        } catch {
          return false;
        }
      });
    }

    // Get status mappings from monthly_report_status_registry
    const statusMappings = await this.db
      .select({
        rawStatus: monthlyReportStatusRegistry.rawStatus,
        displayStatus: monthlyReportStatusRegistry.displayStatus,
      })
      .from(monthlyReportStatusRegistry)
      .all();

    const statusMap = new Map(
      statusMappings.map((r) => [r.rawStatus, r.displayStatus]),
    );

    // Group by registered application name (not raw aplicativos) and count by level
    const appMap = new Map<
      string,
      {
        l2Count: number;
        l3Count: number;
        unmappedCount: number;
        unmappedRequests: UnmappedRequest[];
      }
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      // Use registered app name if available, otherwise "Unknown"
      const application = result.registeredAppName || 'Unknown';

      if (!appMap.has(application)) {
        appMap.set(application, {
          l2Count: 0,
          l3Count: 0,
          unmappedCount: 0,
          unmappedRequests: [],
        });
      }

      const appData = appMap.get(application)!;
      const mappedStatus = statusMap.get(record.requestStatus);

      if (!mappedStatus) {
        // Unmapped status
        appData.unmappedCount++;
        appData.unmappedRequests.push({
          requestId: record.requestId,
          requestIdLink: record.requestIdLink ?? undefined,
          rawStatus: record.requestStatus || 'Unknown',
        });
      } else if (mappedStatus === DisplayStatus.OnGoingL2 || mappedStatus === DisplayStatus.Closed) {
        appData.l2Count++;
      } else if (
        mappedStatus === DisplayStatus.OnGoingL3 ||
        mappedStatus === DisplayStatus.InL3Backlog
      ) {
        appData.l3Count++;
      }
    }

    // Build result array
    const data: StabilityIndicatorRow[] = [];
    let hasUnmappedStatuses = false;

    for (const [application, counts] of appMap) {
      if (counts.unmappedCount > 0) {
        hasUnmappedStatuses = true;
      }

      data.push({
        application,
        l2Count: counts.l2Count,
        l3Count: counts.l3Count,
        unmappedCount: counts.unmappedCount,
        unmappedRequests: counts.unmappedRequests,
        total: counts.l2Count + counts.l3Count + counts.unmappedCount,
      });
    }

    // Sort by total descending
    data.sort((a, b) => b.total - a.total);

    return { data, hasUnmappedStatuses };
  }

  async findCategoryDistribution(
    app?: string,
    month?: string,
  ): Promise<CategoryDistributionResult> {
    // Query all records with application mapping and categorization display value
    const queryResults = await this.db
      .select({
        monthlyReport: monthlyReports,
        registeredAppCode: applicationRegistry.code,
        mappedCategoryDisplayValue: categorizationRegistry.displayValue,
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
      .leftJoin(
        categorizationRegistry,
        and(
          eq(monthlyReports.categorizacion, categorizationRegistry.sourceValue),
          eq(categorizationRegistry.isActive, true),
        ),
      )
      .all();

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.monthlyReport.requestId)) return false;
      seenIds.add(r.monthlyReport.requestId);
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
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
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

    // Group by category and count by recurrency
    const categoryMap = new Map<
      string,
      {
        categoryDisplayValue: string | null;
        recurringCount: number;
        newCount: number;
        unassignedCount: number;
        unassignedRequests: UnassignedRecurrencyRequest[];
      }
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      const categorySourceValue = record.categorizacion || 'Unknown';
      const categoryDisplayValue = result.mappedCategoryDisplayValue || null;

      if (!categoryMap.has(categorySourceValue)) {
        categoryMap.set(categorySourceValue, {
          categoryDisplayValue,
          recurringCount: 0,
          newCount: 0,
          unassignedCount: 0,
          unassignedRequests: [],
        });
      }

      const catData = categoryMap.get(categorySourceValue)!;
      const mappedRecurrency = mapRecurrency(record.recurrencia);

      if (mappedRecurrency === Recurrency.Recurring) {
        catData.recurringCount++;
      } else if (mappedRecurrency === Recurrency.New) {
        catData.newCount++;
      } else {
        catData.unassignedCount++;
        catData.unassignedRequests.push({
          requestId: record.requestId,
          requestIdLink: record.requestIdLink ?? undefined,
          rawRecurrency: record.recurrencia || 'Empty',
        });
      }
    }

    // Build result array with percentages
    const totalIncidents = filteredResults.length;
    const data: CategoryDistributionRow[] = [];

    for (const [categorySourceValue, counts] of categoryMap) {
      const total = counts.recurringCount + counts.newCount + counts.unassignedCount;
      data.push({
        categorySourceValue,
        categoryDisplayValue: counts.categoryDisplayValue,
        recurringCount: counts.recurringCount,
        newCount: counts.newCount,
        unassignedCount: counts.unassignedCount,
        unassignedRequests: counts.unassignedRequests,
        total,
        percentage: totalIncidents > 0 ? Math.round((total / totalIncidents) * 10000) / 100 : 0,
      });
    }

    // Sort by total descending
    data.sort((a, b) => b.total - a.total);

    return { data, monthName, totalIncidents };
  }

  async findBusinessFlowByPriority(
    app?: string,
    month?: string,
  ): Promise<BusinessFlowPriorityResult> {
    // Query all records with application mapping and module display value
    const queryResults = await this.db
      .select({
        monthlyReport: monthlyReports,
        registeredAppCode: applicationRegistry.code,
        mappedModuleDisplayValue: moduleRegistry.displayValue,
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
      .leftJoin(
        moduleRegistry,
        and(
          eq(monthlyReports.modulo, moduleRegistry.sourceValue),
          eq(moduleRegistry.isActive, true),
        ),
      )
      .all();

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.monthlyReport.requestId)) return false;
      seenIds.add(r.monthlyReport.requestId);
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
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
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

    // Define priority order using Priority enum values
    const priorityOrder = [
      Priority.Critical,
      Priority.High,
      Priority.Medium,
      Priority.Low,
    ];

    // First, collect ALL unique modules from all records (sourceValue -> displayValue)
    const allModules = new Map<string, string | null>();
    for (const result of filteredResults) {
      const moduleSourceValue = result.monthlyReport.modulo || 'Unknown';
      const moduleDisplayValue = result.mappedModuleDisplayValue || null;
      if (!allModules.has(moduleSourceValue)) {
        allModules.set(moduleSourceValue, moduleDisplayValue);
      }
    }

    // Group by priority → module (initialize all modules with 0 for each priority)
    const priorityMap = new Map<string, Map<string, number>>();

    for (const priority of priorityOrder) {
      const moduleMap = new Map<string, number>();
      // Initialize all modules with 0
      for (const [moduleSourceValue] of allModules) {
        moduleMap.set(moduleSourceValue, 0);
      }
      priorityMap.set(priority, moduleMap);
    }

    // Count actual records
    for (const result of filteredResults) {
      const record = result.monthlyReport;
      const priority = record.priority || 'Unknown';
      const module = record.modulo || 'Unknown';

      // Only count known priorities
      if (priorityMap.has(priority)) {
        const moduleMap = priorityMap.get(priority)!;
        moduleMap.set(module, (moduleMap.get(module) || 0) + 1);
      }
    }

    // Build result array with top 5 modules per priority
    const totalIncidents = filteredResults.length;
    const data: PriorityBreakdown[] = [];

    for (const priority of priorityOrder) {
      const moduleMap = priorityMap.get(priority)!;

      // Convert to array, sort by count descending, take top 5 (including zeros)
      const modules: ModuleCount[] = Array.from(moduleMap.entries())
        .map(([moduleSourceValue, count]) => ({
          moduleSourceValue,
          moduleDisplayValue: allModules.get(moduleSourceValue) || null,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const totalCount = modules.reduce((sum, m) => sum + m.count, 0);

      data.push({
        priority,
        totalCount,
        modules,
      });
    }

    return { data, monthName, totalIncidents };
  }

  async findPriorityByApp(
    app?: string,
    month?: string,
  ): Promise<PriorityByAppResult> {
    // Query all records with application mapping
    const queryResults = await this.db
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
      .all();

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.monthlyReport.requestId)) return false;
      seenIds.add(r.monthlyReport.requestId);
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
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
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

    // Group by registered application name and count by priority
    const appMap = new Map<
      string,
      {
        criticalCount: number;
        highCount: number;
        mediumCount: number;
        lowCount: number;
      }
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      // Use registered app name if available, otherwise "Unknown"
      const application = result.registeredAppName || 'Unknown';

      if (!appMap.has(application)) {
        appMap.set(application, {
          criticalCount: 0,
          highCount: 0,
          mediumCount: 0,
          lowCount: 0,
        });
      }

      const appData = appMap.get(application)!;
      const priority = record.priority;

      if (priority === Priority.Critical) {
        appData.criticalCount++;
      } else if (priority === Priority.High) {
        appData.highCount++;
      } else if (priority === Priority.Medium) {
        appData.mediumCount++;
      } else if (priority === Priority.Low) {
        appData.lowCount++;
      }
    }

    // Build result array
    const totalIncidents = filteredResults.length;
    const data: PriorityByAppRow[] = [];

    for (const [application, counts] of appMap) {
      data.push({
        application,
        criticalCount: counts.criticalCount,
        highCount: counts.highCount,
        mediumCount: counts.mediumCount,
        lowCount: counts.lowCount,
        total:
          counts.criticalCount +
          counts.highCount +
          counts.mediumCount +
          counts.lowCount,
      });
    }

    // Sort by total descending
    data.sort((a, b) => b.total - a.total);

    return { data, monthName, totalIncidents };
  }

  async findIncidentsByWeek(
    app?: string,
    year: number = 2025,
  ): Promise<IncidentsByWeekResult> {
    // Query all records with application mapping
    const queryResults = await this.db
      .select({
        monthlyReport: monthlyReports,
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
      .all();

    // Deduplicate by requestId (a record may match multiple patterns)
    const seenIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenIds.has(r.monthlyReport.requestId)) return false;
      seenIds.add(r.monthlyReport.requestId);
      return true;
    });

    // Filter by app if provided
    let filteredResults = uniqueResults;
    if (app && app !== 'all') {
      filteredResults = uniqueResults.filter(
        (r) => r.registeredAppCode === app,
      );
    }

    // Filter by year and group by ISO week number
    const weekMap = new Map<number, number>();

    for (const result of filteredResults) {
      try {
        const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
        if (!createdDate.isValid) continue;

        // Check if the year matches
        if (createdDate.year !== year) continue;

        const weekNumber = createdDate.weekNumber;
        weekMap.set(weekNumber, (weekMap.get(weekNumber) || 0) + 1);
      } catch {
        continue;
      }
    }

    // Build result array with date ranges
    const data: IncidentsByWeekRow[] = [];

    for (const [weekNumber, count] of weekMap) {
      // Get the start and end of the ISO week
      const weekStart = DateTime.fromObject({ weekYear: year, weekNumber, weekday: 1 });
      const weekEnd = DateTime.fromObject({ weekYear: year, weekNumber, weekday: 7 });

      data.push({
        weekNumber,
        year,
        count,
        startDate: weekStart.toFormat('MMM d'),
        endDate: weekEnd.toFormat('MMM d'),
      });
    }

    // Sort by week number ascending
    data.sort((a, b) => a.weekNumber - b.weekNumber);

    const totalIncidents = data.reduce((sum, row) => sum + row.count, 0);

    return { data, year, totalIncidents };
  }
}
