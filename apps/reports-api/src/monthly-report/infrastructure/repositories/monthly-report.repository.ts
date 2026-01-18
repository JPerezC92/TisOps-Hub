import { Injectable, Inject } from '@nestjs/common';
import { Database, DATABASE_CONNECTION, monthlyReports, InsertMonthlyReport, applicationRegistry, applicationPatterns, MonthlyReport, parentChildRequests, monthlyReportStatusRegistry, categorizationRegistry, moduleRegistry, weeklyCorrectives, correctiveStatusRegistry, problems } from '@repo/database';
import { and, eq, sql } from 'drizzle-orm';
import { DEFAULT_DISPLAY_STATUS, DisplayStatus, Recurrency, mapRecurrency, CorrectiveStatus, PrioritySpanish, Priority } from '@repo/reports';
import { DateTime } from 'luxon';
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
  IncidentOverviewByCategoryResult,
  IncidentOverviewItem,
  L3StatusItem,
  L3SummaryResult,
  L3SummaryRow,
  L3RequestsByStatusResult,
  L3RequestDetail,
  MissingScopeByParentResult,
  MissingScopeByParentRow,
  BugsByParentResult,
  BugsByParentRow,
  CriticalIncidentWithMapping,
  IncidentsByDayResult,
  IncidentsByDayRow,
  IncidentsByReleaseByDayResult,
  IncidentsByReleaseByDayRow,
  ChangeReleaseByModuleResult,
  ChangeReleaseByModuleRow,
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

  async findCriticalIncidentsFiltered(app?: string, month?: string): Promise<CriticalIncidentWithMapping[]> {
    let results: CriticalIncidentWithMapping[];

    if (app && app !== 'all') {
      // Filter by application using JOIN with pattern matching and registry mappings
      const queryResults = await this.db
        .selectDistinct({
          monthlyReport: monthlyReports,
          mappedModuleDisplayValue: moduleRegistry.displayValue,
          mappedStatusDisplayValue: correctiveStatusRegistry.displayStatus,
          mappedCategorizationDisplayValue: categorizationRegistry.displayValue,
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
          correctiveStatusRegistry,
          and(
            eq(monthlyReports.requestStatus, correctiveStatusRegistry.rawStatus),
            eq(correctiveStatusRegistry.isActive, true),
          ),
        )
        .leftJoin(
          categorizationRegistry,
          and(
            eq(monthlyReports.categorizacion, categorizationRegistry.sourceValue),
            eq(categorizationRegistry.isActive, true),
          ),
        )
        .where(
          and(
            eq(monthlyReports.priority, Priority.Critical),
            eq(applicationRegistry.code, app),
          ),
        )
        .all();

      results = queryResults;
    } else {
      // Get all Critical priority records without app filter, with registry mappings
      const queryResults = await this.db
        .select({
          monthlyReport: monthlyReports,
          mappedModuleDisplayValue: moduleRegistry.displayValue,
          mappedStatusDisplayValue: correctiveStatusRegistry.displayStatus,
          mappedCategorizationDisplayValue: categorizationRegistry.displayValue,
        })
        .from(monthlyReports)
        .leftJoin(
          moduleRegistry,
          and(
            eq(monthlyReports.modulo, moduleRegistry.sourceValue),
            eq(moduleRegistry.isActive, true),
          ),
        )
        .leftJoin(
          correctiveStatusRegistry,
          and(
            eq(monthlyReports.requestStatus, correctiveStatusRegistry.rawStatus),
            eq(correctiveStatusRegistry.isActive, true),
          ),
        )
        .leftJoin(
          categorizationRegistry,
          and(
            eq(monthlyReports.categorizacion, categorizationRegistry.sourceValue),
            eq(categorizationRegistry.isActive, true),
          ),
        )
        .where(eq(monthlyReports.priority, Priority.Critical))
        .all();

      results = queryResults;
    }

    // Filter by month if provided (format: YYYY-MM)
    if (month) {
      results = results.filter((result) => {
        try {
          // createdTime is now a Date object
          const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);

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

    return results;
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
        displayStatus: displayStatus === DisplayStatus.Closed && record.informacionAdicional
          ? record.informacionAdicional
          : displayStatus,
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
          percentage: 0, // Placeholder, calculated after loop
          tickets,
        });
      }

      // Calculate categorization percentages based on module count (module = 100%)
      for (const cat of categorizations) {
        cat.percentage = moduleCount > 0
          ? Math.round((cat.count / moduleCount) * 10000) / 100
          : 0;
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

  async findIncidentOverviewByCategory(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IncidentOverviewByCategoryResult> {
    // Query monthly_reports with all needed JOINs
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

    // Deduplicate by requestId
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

    // Filter by date range (startDate to endDate)
    if (startDate || endDate) {
      const start = startDate ? DateTime.fromISO(startDate).startOf('day') : null;
      const end = endDate ? DateTime.fromISO(endDate).endOf('day') : null;

      filteredResults = filteredResults.filter((result) => {
        try {
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

    // Get status mappings
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

    // Helper function to build category card data
    const buildCategoryCard = (
      records: typeof filteredResults,
    ): { data: IncidentOverviewItem[]; total: number } => {
      const categoryMap = new Map<string, { displayValue: string | null; count: number }>();

      for (const result of records) {
        const category = result.monthlyReport.categorizacion || 'Unknown';
        const displayValue = result.mappedCategoryDisplayValue || null;

        if (!categoryMap.has(category)) {
          categoryMap.set(category, { displayValue, count: 0 });
        }
        categoryMap.get(category)!.count++;
      }

      const total = records.length;
      const data: IncidentOverviewItem[] = [];

      for (const [category, info] of categoryMap) {
        data.push({
          category,
          categoryDisplayValue: info.displayValue,
          count: info.count,
          percentage: total > 0 ? Math.round((info.count / total) * 10000) / 100 : 0,
        });
      }

      data.sort((a, b) => b.count - a.count);
      return { data, total };
    };

    // 1. Resolved in L2 - displayStatus = "Closed"
    const resolvedRecords = filteredResults.filter((r) => {
      const mappedStatus = statusMap.get(r.monthlyReport.requestStatus);
      return mappedStatus === DisplayStatus.Closed;
    });
    const resolvedInL2 = buildCategoryCard(resolvedRecords);

    // 2. Pending - displayStatus = "On going in L2"
    const pendingRecords = filteredResults.filter((r) => {
      const mappedStatus = statusMap.get(r.monthlyReport.requestStatus);
      return mappedStatus === DisplayStatus.OnGoingL2;
    });
    const pending = buildCategoryCard(pendingRecords);

    // 3. Recurrent in L2 & L3 - Group by recurrency
    const recurrencyMap = new Map<string, number>();
    for (const result of filteredResults) {
      const mappedRecurrency = mapRecurrency(result.monthlyReport.recurrencia);
      let recurrencyLabel: string;
      if (mappedRecurrency === Recurrency.Recurring) {
        recurrencyLabel = 'Recurrente';
      } else if (mappedRecurrency === Recurrency.New) {
        recurrencyLabel = 'Nuevo';
      } else {
        recurrencyLabel = 'Unknown';
      }
      recurrencyMap.set(recurrencyLabel, (recurrencyMap.get(recurrencyLabel) || 0) + 1);
    }

    const recurrencyTotal = filteredResults.length;
    const recurrencyData: IncidentOverviewItem[] = [];
    for (const [category, count] of recurrencyMap) {
      recurrencyData.push({
        category,
        categoryDisplayValue: null,
        count,
        percentage: recurrencyTotal > 0 ? Math.round((count / recurrencyTotal) * 10000) / 100 : 0,
      });
    }
    recurrencyData.sort((a, b) => b.count - a.count);
    const recurrentInL2L3 = { data: recurrencyData, total: recurrencyTotal };

    // Query monthly_reports for Nivel 3 records specifically
    const nivel3Results = await this.db
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
        eq(monthlyReports.categorizacion, categorizationRegistry.sourceValue),
      )
      .where(eq(monthlyReports.requestStatus, 'Nivel 3'))
      .all();

    // Deduplicate Nivel 3 results
    const seenNivel3Ids = new Set<number>();
    const uniqueNivel3Results = nivel3Results.filter((r) => {
      if (seenNivel3Ids.has(r.monthlyReport.requestId)) return false;
      seenNivel3Ids.add(r.monthlyReport.requestId);
      return true;
    });

    // Apply app filter if provided
    let filteredNivel3 = uniqueNivel3Results;
    if (app && app !== 'all') {
      filteredNivel3 = uniqueNivel3Results.filter((r) => r.registeredAppCode === app);
    }

    // Apply date range filter (same as filteredResults)
    if (startDate || endDate) {
      const start = startDate ? DateTime.fromISO(startDate).startOf('day') : null;
      const end = endDate ? DateTime.fromISO(endDate).endOf('day') : null;

      filteredNivel3 = filteredNivel3.filter((result) => {
        try {
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

    // 4. Assigned to L3 Backlog - combine mapped statuses + Nivel 3 records
    const l3BacklogRecords = filteredResults.filter((r) => {
      const mappedStatus = statusMap.get(r.monthlyReport.requestStatus);
      return mappedStatus === DisplayStatus.InL3Backlog || mappedStatus === DisplayStatus.OnGoingL3;
    });

    // Merge with Nivel 3 records (deduplicate by requestId)
    const seenBacklogIds = new Set(l3BacklogRecords.map(r => r.monthlyReport.requestId));
    const combinedL3Backlog = [
      ...l3BacklogRecords,
      ...filteredNivel3.filter(r => !seenBacklogIds.has(r.monthlyReport.requestId))
    ];

    const assignedToL3Backlog = buildCategoryCard(combinedL3Backlog);

    // 5. L3 Status - Query weekly_correctives AND monthly_reports (Nivel 3)
    // Weekly mode: createdTime < startDate (records before the date range)
    // Monthly mode: createdTime <= endDate (records up to last day of month)
    const l3StatusData = await this.findL3StatusFromAllSources(app, startDate, endDate);

    return {
      resolvedInL2,
      pending,
      recurrentInL2L3,
      assignedToL3Backlog,
      l3Status: l3StatusData,
    };
  }

  private async findL3StatusFromAllSources(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: L3StatusItem[]; total: number }> {
    // ========== QUERY 1: weekly_correctives ==========
    const weeklyResults = await this.db
      .select({
        weeklyCorrective: weeklyCorrectives,
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

    // ========== QUERY 2: monthly_reports with status 'Nivel 3' ==========
    const monthlyResults = await this.db
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
      .where(eq(monthlyReports.requestStatus, 'Nivel 3'))
      .all();

    // ========== NORMALIZE & MERGE ==========
    interface NormalizedRecord {
      requestId: string;
      requestStatus: string;
      createdTime: DateTime;
      registeredAppCode: string | null;
    }

    // Normalize weekly_correctives
    const normalizedWeekly: NormalizedRecord[] = weeklyResults.map((r) => ({
      requestId: r.weeklyCorrective.requestId,
      requestStatus: r.weeklyCorrective.requestStatus || 'Unknown',
      createdTime: DateTime.fromFormat(r.weeklyCorrective.createdTime, 'dd/MM/yyyy HH:mm'),
      registeredAppCode: r.registeredAppCode,
    })).filter(r => r.createdTime.isValid);

    // Normalize monthly_reports (createdTime is timestamp)
    const normalizedMonthly: NormalizedRecord[] = monthlyResults.map((r) => ({
      requestId: String(r.monthlyReport.requestId),
      requestStatus: r.monthlyReport.requestStatus,
      createdTime: DateTime.fromJSDate(r.monthlyReport.createdTime),
      registeredAppCode: r.registeredAppCode,
    })).filter(r => r.createdTime.isValid);

    // Merge: weekly_correctives first (takes precedence), then monthly_reports
    const seenIds = new Set<string>();
    const mergedResults: NormalizedRecord[] = [];

    for (const record of [...normalizedWeekly, ...normalizedMonthly]) {
      if (!seenIds.has(record.requestId)) {
        seenIds.add(record.requestId);
        mergedResults.push(record);
      }
    }

    // ========== FILTER BY APP ==========
    let filteredResults = mergedResults;
    if (app && app !== 'all') {
      filteredResults = mergedResults.filter((r) => r.registeredAppCode === app);
    }

    // ========== FILTER BY DATE ==========
    // - If only endDate provided (Monthly mode): createdTime <= endDate
    // - If startDate provided (Weekly mode): createdTime < startDate (records before the date range)

    if (endDate && !startDate) {
      // Monthly mode: createdTime <= endDate (last day of month)
      const end = DateTime.fromISO(endDate).endOf('day');
      filteredResults = filteredResults.filter((r) => r.createdTime <= end);
    } else if (startDate) {
      // Weekly mode: createdTime < startDate (records before the date range)
      const start = DateTime.fromISO(startDate).startOf('day');
      filteredResults = filteredResults.filter((r) => r.createdTime < start);
    }

    // ========== STATUS MAPPING ==========
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

    // ========== COUNT BY STATUS ==========
    const statusCountMap = new Map<string, number>();

    // Initialize with all CorrectiveStatus values
    for (const status of Object.values(CorrectiveStatus)) {
      statusCountMap.set(status, 0);
    }

    for (const result of filteredResults) {
      const displayStatus = statusMap.get(result.requestStatus) || result.requestStatus;

      // Only count if it's a valid CorrectiveStatus
      if (statusCountMap.has(displayStatus)) {
        statusCountMap.set(displayStatus, statusCountMap.get(displayStatus)! + 1);
      }
    }

    // ========== RETURN RESULTS ==========
    const total = filteredResults.length;
    const data: L3StatusItem[] = [];

    // Define order: In Testing, In Backlog, PRD Deployment, Dev in Progress
    const statusOrder = [
      CorrectiveStatus.InTesting,
      CorrectiveStatus.InBacklog,
      CorrectiveStatus.PrdDeployment,
      CorrectiveStatus.DevInProgress,
    ];

    for (const status of statusOrder) {
      const count = statusCountMap.get(status) || 0;
      data.push({
        status,
        count,
        percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
      });
    }

    return { data, total };
  }

  async findL3Summary(
    app?: string,
  ): Promise<L3SummaryResult> {
    // ===== 1. Query weekly_correctives (all records are L3) =====
    const weeklyResults = await this.db
      .select({
        weeklyCorrective: weeklyCorrectives,
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
      appCode: string | null;
      source: 'weekly' | 'monthly';
    }

    const normalizedWeekly: NormalizedRecord[] = uniqueWeeklyResults.map((r) => ({
      requestId: r.weeklyCorrective.requestId,
      rawStatus: r.weeklyCorrective.requestStatus || 'Unknown',
      priority: r.weeklyCorrective.priority || '',
      appCode: r.registeredAppCode,
      source: 'weekly' as const,
    }));

    const normalizedMonthly: NormalizedRecord[] = uniqueMonthlyResults.map((r) => ({
      requestId: String(r.monthlyReport.requestId),
      rawStatus: r.monthlyReport.requestStatus || 'Unknown',
      priority: r.monthlyReport.priority || '',
      appCode: r.registeredAppCode,
      source: 'monthly' as const,
    }));

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

    // ===== 6. Get status mappings from corrective_status_registry =====
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

    // Map Spanish priorities to English
    const priorityMap: Record<string, string> = {
      [PrioritySpanish.Critica]: Priority.Critical,
      [PrioritySpanish.Alta]: Priority.High,
      [PrioritySpanish.Media]: Priority.Medium,
      [PrioritySpanish.Baja]: Priority.Low,
    };

    // Status labels mapping
    const statusLabels: Record<string, string> = {
      [CorrectiveStatus.DevInProgress]: 'Tickets in L3 – Dev in progress (assigned capacity)',
      [CorrectiveStatus.InBacklog]: 'Tickets in L3 – In backlog',
      [CorrectiveStatus.InTesting]: 'Tickets in L3 – In testing',
      [CorrectiveStatus.PrdDeployment]: 'Tickets in L3 – Ready to deploy',
    };

    // Status order from user's image: Dev in Progress, In Backlog, In Testing, PRD Deployment
    const statusOrder = [
      CorrectiveStatus.DevInProgress,
      CorrectiveStatus.InBacklog,
      CorrectiveStatus.InTesting,
      CorrectiveStatus.PrdDeployment,
    ];

    // ===== 7. Initialize status-priority matrix =====
    const matrix = new Map<string, Map<string, number>>();
    for (const status of statusOrder) {
      const priorityCounts = new Map<string, number>();
      priorityCounts.set(Priority.Critical, 0);
      priorityCounts.set(Priority.High, 0);
      priorityCounts.set(Priority.Medium, 0);
      priorityCounts.set(Priority.Low, 0);
      matrix.set(status, priorityCounts);
    }

    // ===== 8. Count by status AND priority =====
    for (const record of filteredResults) {
      const rawStatus = record.rawStatus;

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

      // Get priority - weekly is Spanish, monthly is already English
      const rawPriority = record.priority;
      let englishPriority: string | null = null;

      if (record.source === 'weekly') {
        // Weekly priorities are in Spanish - need mapping
        englishPriority = priorityMap[rawPriority] || null;
      } else {
        // Monthly priorities are already in English - use directly if valid
        const validPriorities = [Priority.Critical, Priority.High, Priority.Medium, Priority.Low];
        englishPriority = validPriorities.includes(rawPriority as any) ? rawPriority : null;
      }

      // Only count if both status and priority are valid
      if (matrix.has(displayStatus) && englishPriority) {
        const priorityCounts = matrix.get(displayStatus)!;
        priorityCounts.set(englishPriority, (priorityCounts.get(englishPriority) || 0) + 1);
      }
    }

    // Build result array
    const data: L3SummaryRow[] = [];
    const totals = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    };

    for (const status of statusOrder) {
      const priorityCounts = matrix.get(status)!;
      const critical = priorityCounts.get(Priority.Critical) || 0;
      const high = priorityCounts.get(Priority.High) || 0;
      const medium = priorityCounts.get(Priority.Medium) || 0;
      const low = priorityCounts.get(Priority.Low) || 0;
      const rowTotal = critical + high + medium + low;

      data.push({
        status,
        statusLabel: statusLabels[status] || status,
        critical,
        high,
        medium,
        low,
        total: rowTotal,
      });

      totals.critical += critical;
      totals.high += high;
      totals.medium += medium;
      totals.low += low;
      totals.total += rowTotal;
    }

    return { data, totals };
  }

  async findL3RequestsByStatus(
    app?: string,
  ): Promise<L3RequestsByStatusResult> {
    // ===== QUERY 1: weekly_correctives with application and module mapping =====
    const weeklyResults = await this.db
      .select({
        weeklyCorrective: weeklyCorrectives,
        registeredAppCode: applicationRegistry.code,
        mappedModuleDisplayValue: moduleRegistry.displayValue,
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
      .leftJoin(
        moduleRegistry,
        and(
          eq(weeklyCorrectives.modulo, moduleRegistry.sourceValue),
          eq(moduleRegistry.isActive, true),
        ),
      )
      .all();

    // Deduplicate weekly by requestId
    const seenWeeklyIds = new Set<string>();
    const uniqueWeeklyResults = weeklyResults.filter((r) => {
      if (seenWeeklyIds.has(r.weeklyCorrective.requestId)) return false;
      seenWeeklyIds.add(r.weeklyCorrective.requestId);
      return true;
    });

    // ===== QUERY 2: monthly_reports with status 'Nivel 3' =====
    const monthlyNivel3Results = await this.db
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
      .where(eq(monthlyReports.requestStatus, 'Nivel 3'))
      .all();

    // Deduplicate monthly by requestId
    const seenMonthlyIds = new Set<number>();
    const uniqueMonthlyResults = monthlyNivel3Results.filter((r) => {
      if (seenMonthlyIds.has(r.monthlyReport.requestId)) return false;
      seenMonthlyIds.add(r.monthlyReport.requestId);
      return true;
    });

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

    // Get linked tickets count from parent_child_requests
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

    // Map Spanish priorities to English
    const priorityMapSpanish: Record<string, string> = {
      [PrioritySpanish.Critica]: Priority.Critical,
      [PrioritySpanish.Alta]: Priority.High,
      [PrioritySpanish.Media]: Priority.Medium,
      [PrioritySpanish.Baja]: Priority.Low,
    };

    // Helper function to format date as d-MMM-yyyy (e.g., "4-Aug-2025")
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        // Try parsing as dd/MM/yyyy HH:mm format
        const parsed = DateTime.fromFormat(dateStr, 'dd/MM/yyyy HH:mm');
        if (parsed.isValid) {
          return parsed.toFormat('d-MMM-yyyy');
        }
        // Try parsing as ISO format
        const isoDate = DateTime.fromISO(dateStr);
        if (isoDate.isValid) {
          return isoDate.toFormat('d-MMM-yyyy');
        }
        return dateStr;
      } catch {
        return dateStr;
      }
    };

    // Helper function to format ETA as d-MMM (e.g., "19-Jan")
    const formatEta = (dateStr: string): string => {
      if (!dateStr) return '';
      // Handle "No asignado" values
      if (dateStr.toLowerCase().trim() === 'no asignado') return 'TBD';
      try {
        const parsed = DateTime.fromFormat(dateStr, 'dd/MM/yyyy HH:mm');
        if (parsed.isValid) {
          return parsed.toFormat('d-MMM');
        }
        const isoDate = DateTime.fromISO(dateStr);
        if (isoDate.isValid) {
          return isoDate.toFormat('d-MMM');
        }
        return dateStr;
      } catch {
        return dateStr;
      }
    };

    // Helper to parse date for sorting (returns timestamp for comparison)
    const parseDateForSort = (dateStr: string): number => {
      if (!dateStr) return 0;
      try {
        const parsed = DateTime.fromFormat(dateStr, 'dd/MM/yyyy HH:mm');
        if (parsed.isValid) return parsed.toMillis();
        const isoDate = DateTime.fromISO(dateStr);
        if (isoDate.isValid) return isoDate.toMillis();
        return 0;
      } catch {
        return 0;
      }
    };

    // Priority order mapping using English (for both sources)
    const priorityOrderEnglish: Record<string, number> = {
      [Priority.Critical]: 1,
      [Priority.High]: 2,
      [Priority.Medium]: 3,
      [Priority.Low]: 4,
    };

    // ===== NORMALIZE BOTH SOURCES =====
    interface NormalizedRecord {
      requestId: string;
      requestIdLink?: string;
      rawStatus: string;
      createdTime: string;
      createdTimeMs: number;
      modulo: string;
      subject: string;
      priority: string;
      priorityEnglish: string;
      registeredAppCode: string | null;
      eta: string;
      source: 'weekly' | 'monthly';
    }

    // Normalize weekly_correctives
    const normalizedWeekly: NormalizedRecord[] = uniqueWeeklyResults.map((r) => {
      const rawPriority = r.weeklyCorrective.priority || '';
      return {
        requestId: r.weeklyCorrective.requestId,
        requestIdLink: r.weeklyCorrective.requestIdLink || undefined,
        rawStatus: r.weeklyCorrective.requestStatus || 'Unknown',
        createdTime: r.weeklyCorrective.createdTime || '',
        createdTimeMs: parseDateForSort(r.weeklyCorrective.createdTime || ''),
        modulo: r.mappedModuleDisplayValue || r.weeklyCorrective.modulo || '',
        subject: r.weeklyCorrective.subject || '',
        priority: rawPriority,
        priorityEnglish: priorityMapSpanish[rawPriority] || rawPriority,
        registeredAppCode: r.registeredAppCode,
        eta: r.weeklyCorrective.eta || '',
        source: 'weekly' as const,
      };
    });

    // Normalize monthly_reports (Nivel 3) - priorities already in English
    const normalizedMonthly: NormalizedRecord[] = uniqueMonthlyResults.map((r) => {
      const rawPriority = r.monthlyReport.priority || '';
      const createdTimeMs = r.monthlyReport.createdTime
        ? DateTime.fromJSDate(r.monthlyReport.createdTime).toMillis()
        : 0;
      const createdTimeStr = r.monthlyReport.createdTime
        ? DateTime.fromJSDate(r.monthlyReport.createdTime).toFormat('dd/MM/yyyy HH:mm')
        : '';
      return {
        requestId: String(r.monthlyReport.requestId),
        requestIdLink: r.monthlyReport.requestIdLink || undefined,
        rawStatus: 'Nivel 3', // Always Nivel 3 -> maps to In Backlog
        createdTime: createdTimeStr,
        createdTimeMs,
        modulo: r.mappedModuleDisplayValue || r.monthlyReport.modulo || '',
        subject: r.monthlyReport.subject || '',
        priority: rawPriority,
        priorityEnglish: rawPriority, // Already in English
        registeredAppCode: r.registeredAppCode,
        eta: r.monthlyReport.eta || '',
        source: 'monthly' as const,
      };
    });

    // ===== MERGE WITH DEDUPLICATION (weekly takes precedence) =====
    const allSeenIds = new Set<string>();
    const mergedResults: NormalizedRecord[] = [];

    for (const record of normalizedWeekly) {
      if (!allSeenIds.has(record.requestId)) {
        allSeenIds.add(record.requestId);
        mergedResults.push(record);
      }
    }

    for (const record of normalizedMonthly) {
      if (!allSeenIds.has(record.requestId)) {
        allSeenIds.add(record.requestId);
        mergedResults.push(record);
      }
    }

    // ===== FILTER BY APP =====
    let filteredResults = mergedResults;
    if (app && app !== 'all') {
      filteredResults = mergedResults.filter((r) => r.registeredAppCode === app);
    }

    // ===== GROUP BY STATUS =====
    interface TempRequestDetail extends L3RequestDetail {
      rawCreatedTime: string;
      createdTimeMs: number;
    }

    const devInProgressTemp: TempRequestDetail[] = [];
    const inBacklogTemp: TempRequestDetail[] = [];
    const inTestingTemp: TempRequestDetail[] = [];
    const prdDeploymentTemp: TempRequestDetail[] = [];

    for (const record of filteredResults) {
      // Get display status from mapping, default Nivel 3 to In Backlog
      let displayStatus = statusMap.get(record.rawStatus);
      if (!displayStatus && record.rawStatus === 'Nivel 3') {
        displayStatus = CorrectiveStatus.InBacklog;
      }
      if (!displayStatus) {
        displayStatus = record.rawStatus;
      }

      // Get linked tickets count
      const linkedTicketsCount = linkedCountMap.get(record.requestId) || 0;

      const requestDetail: TempRequestDetail = {
        requestId: record.requestId,
        requestIdLink: record.requestIdLink,
        createdTime: formatDate(record.createdTime),
        rawCreatedTime: record.createdTime,
        createdTimeMs: record.createdTimeMs,
        modulo: record.modulo,
        subject: record.subject,
        priority: record.priority,
        priorityEnglish: record.priorityEnglish,
        linkedTicketsCount,
        eta: formatEta(record.eta),
      };

      // Assign to the appropriate array based on status
      if (displayStatus === CorrectiveStatus.DevInProgress) {
        devInProgressTemp.push(requestDetail);
      } else if (displayStatus === CorrectiveStatus.InBacklog) {
        inBacklogTemp.push(requestDetail);
      } else if (displayStatus === CorrectiveStatus.InTesting) {
        inTestingTemp.push(requestDetail);
      } else if (displayStatus === CorrectiveStatus.PrdDeployment) {
        prdDeploymentTemp.push(requestDetail);
      }
    }

    // Sort function: by English priority (Critical first), then by createdTime (newest first)
    const sortRequests = (a: TempRequestDetail, b: TempRequestDetail): number => {
      const priorityA = priorityOrderEnglish[a.priorityEnglish] ?? 5;
      const priorityB = priorityOrderEnglish[b.priorityEnglish] ?? 5;
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Critical first
      }
      // Newest first (descending order)
      return b.createdTimeMs - a.createdTimeMs;
    };

    // Sort each array
    devInProgressTemp.sort(sortRequests);
    inBacklogTemp.sort(sortRequests);
    inTestingTemp.sort(sortRequests);
    prdDeploymentTemp.sort(sortRequests);

    // Remove temporary fields from final output
    const cleanDetails = (arr: TempRequestDetail[]): L3RequestDetail[] =>
      arr.map(({ rawCreatedTime, createdTimeMs, ...rest }) => rest);

    return {
      devInProgress: cleanDetails(devInProgressTemp),
      inBacklog: cleanDetails(inBacklogTemp),
      inTesting: cleanDetails(inTestingTemp),
      prdDeployment: cleanDetails(prdDeploymentTemp),
    };
  }

  async findMissingScopeByParent(
    app?: string,
    month?: string,
  ): Promise<MissingScopeByParentResult> {
    // Query monthly_reports where categorizacion = 'Error de Alcance' (missing scope)
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
      .where(eq(monthlyReports.categorizacion, 'Error de Alcance'))
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

    // Get all weekly_correctives records for lookup
    const correctivesRecords = await this.db
      .select({
        requestId: weeklyCorrectives.requestId,
        createdTime: weeklyCorrectives.createdTime,
        eta: weeklyCorrectives.eta,
        requestStatus: weeklyCorrectives.requestStatus,
      })
      .from(weeklyCorrectives)
      .all();

    const correctivesMap = new Map(
      correctivesRecords.map((r) => [r.requestId, r]),
    );

    // Get all problems records for lookup (requestId is integer, convert to string for comparison)
    const problemsRecords = await this.db
      .select({
        requestId: problems.requestId,
        createdTime: problems.createdTime,
        dueByTime: problems.dueByTime,
        requestStatus: problems.requestStatus,
      })
      .from(problems)
      .all();

    const problemsMap = new Map(
      problemsRecords.map((r) => [String(r.requestId), r]),
    );

    // Get linked ticket counts from parent_child_requests table (all time)
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

    // Helper to identify unassigned records
    const isUnassigned = (id: string | null | undefined): boolean => {
      if (!id) return true;
      const trimmed = id.trim().toLowerCase();
      return trimmed === '' || trimmed === '0' || trimmed === 'no asignado';
    };

    const UNASSIGNED_KEY = '__UNASSIGNED__';

    // Group by linkedRequestId and count
    const parentMap = new Map<
      string,
      {
        linkedRequestIdLink: string | null;
        additionalInfos: string[];
        countInMonth: number;
      }
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      const rawLinkedRequestId = record.linkedRequestId;
      const linkedRequestId = isUnassigned(rawLinkedRequestId)
        ? UNASSIGNED_KEY
        : rawLinkedRequestId!;
      const linkedRequestIdLink = isUnassigned(rawLinkedRequestId)
        ? null
        : record.linkedRequestIdLink || null;

      if (!parentMap.has(linkedRequestId)) {
        parentMap.set(linkedRequestId, {
          linkedRequestIdLink,
          additionalInfos: [],
          countInMonth: 0,
        });
      }

      const parentData = parentMap.get(linkedRequestId)!;
      parentData.countInMonth++;

      // Collect additional info (we'll use the first non-empty one) - skip for unassigned
      if (!isUnassigned(rawLinkedRequestId) && record.informacionAdicional && record.informacionAdicional.trim()) {
        parentData.additionalInfos.push(record.informacionAdicional);
      }
    }

    // Helper function to format date
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        // Try parsing as dd/MM/yyyy HH:mm format
        const parsed = DateTime.fromFormat(dateStr, 'dd/MM/yyyy HH:mm');
        if (parsed.isValid) {
          return parsed.toFormat('d-MMM-yyyy');
        }
        // Try parsing as ISO format
        const isoDate = DateTime.fromISO(dateStr);
        if (isoDate.isValid) {
          return isoDate.toFormat('d-MMM-yyyy');
        }
        return dateStr;
      } catch {
        return dateStr;
      }
    };

    // Build result array
    const totalIncidents = filteredResults.length;
    const data: MissingScopeByParentRow[] = [];

    for (const [linkedRequestId, info] of parentMap) {
      // Handle unassigned row specially
      if (linkedRequestId === UNASSIGNED_KEY) {
        data.push({
          createdDate: '',
          linkedRequestId: '',
          linkedRequestIdLink: null,
          additionalInfo: 'To be evaluated',
          totalLinkedTickets: 0,
          linkedTicketsInMonth: info.countInMonth,
          requestStatus: '',
          eta: '',
        });
        continue;
      }

      // Look up parent ticket info from weekly_correctives first, then problems
      let createdDate = '';
      let eta = '';
      let requestStatus = '';

      const corrective = correctivesMap.get(linkedRequestId);
      if (corrective) {
        createdDate = formatDate(corrective.createdTime);
        eta = formatDate(corrective.eta || '');
        requestStatus = corrective.requestStatus || '';
      } else {
        // Try problems table
        const problem = problemsMap.get(linkedRequestId);
        if (problem) {
          createdDate = formatDate(problem.createdTime);
          eta = formatDate(problem.dueByTime || '');
          requestStatus = problem.requestStatus || '';
        }
      }

      // Get total linked tickets count (all time)
      const totalLinkedTickets = linkedCountMap.get(linkedRequestId) || 0;

      // Use the first additional info found
      const additionalInfo = info.additionalInfos.length > 0 ? info.additionalInfos[0] : '';

      data.push({
        createdDate,
        linkedRequestId,
        linkedRequestIdLink: info.linkedRequestIdLink,
        additionalInfo,
        totalLinkedTickets,
        linkedTicketsInMonth: info.countInMonth,
        requestStatus,
        eta,
      });
    }

    // Sort by createdDate descending (most recent first), empty dates at end
    data.sort((a, b) => {
      // Empty dates go after non-empty dates
      if (!a.createdDate && !b.createdDate) return 0;
      if (!a.createdDate) return 1;
      if (!b.createdDate) return -1;

      // Parse dates and compare
      const dateA = DateTime.fromFormat(a.createdDate, 'd-MMM-yyyy');
      const dateB = DateTime.fromFormat(b.createdDate, 'd-MMM-yyyy');

      if (!dateA.isValid && !dateB.isValid) return 0;
      if (!dateA.isValid) return 1;
      if (!dateB.isValid) return -1;

      return dateB.toMillis() - dateA.toMillis(); // Descending
    });

    // Move unassigned row (empty linkedRequestId) to end
    const unassignedIndex = data.findIndex(row => row.linkedRequestId === '');
    if (unassignedIndex !== -1) {
      const [unassignedRow] = data.splice(unassignedIndex, 1);
      data.push(unassignedRow);
    }

    return { data, monthName, totalIncidents };
  }

  async findBugsByParent(
    app?: string,
    month?: string,
  ): Promise<BugsByParentResult> {
    // Query monthly_reports where categorizacion = 'Error de codificación (Bug)'
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
      .where(eq(monthlyReports.categorizacion, 'Error de codificación (Bug)'))
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

    // Get all weekly_correctives records for lookup
    const correctivesRecordsBugs = await this.db
      .select({
        requestId: weeklyCorrectives.requestId,
        createdTime: weeklyCorrectives.createdTime,
        eta: weeklyCorrectives.eta,
        requestStatus: weeklyCorrectives.requestStatus,
      })
      .from(weeklyCorrectives)
      .all();

    const correctivesMapBugs = new Map(
      correctivesRecordsBugs.map((r) => [r.requestId, r]),
    );

    // Get all problems records for lookup (requestId is integer, convert to string for comparison)
    const problemsRecordsBugs = await this.db
      .select({
        requestId: problems.requestId,
        createdTime: problems.createdTime,
        dueByTime: problems.dueByTime,
        requestStatus: problems.requestStatus,
      })
      .from(problems)
      .all();

    const problemsMapBugs = new Map(
      problemsRecordsBugs.map((r) => [String(r.requestId), r]),
    );

    // Get linked ticket counts from parent_child_requests table (all time)
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

    // Helper to identify unassigned records
    const isUnassigned = (id: string | null | undefined): boolean => {
      if (!id) return true;
      const trimmed = id.trim().toLowerCase();
      return trimmed === '' || trimmed === '0' || trimmed === 'no asignado';
    };

    const UNASSIGNED_KEY = '__UNASSIGNED__';

    // Group by linkedRequestId and count
    const parentMap = new Map<
      string,
      {
        linkedRequestIdLink: string | null;
        additionalInfos: string[];
        countInMonth: number;
      }
    >();

    for (const result of filteredResults) {
      const record = result.monthlyReport;
      const rawLinkedRequestId = record.linkedRequestId;
      const linkedRequestId = isUnassigned(rawLinkedRequestId)
        ? UNASSIGNED_KEY
        : rawLinkedRequestId!;
      const linkedRequestIdLink = isUnassigned(rawLinkedRequestId)
        ? null
        : record.linkedRequestIdLink || null;

      if (!parentMap.has(linkedRequestId)) {
        parentMap.set(linkedRequestId, {
          linkedRequestIdLink,
          additionalInfos: [],
          countInMonth: 0,
        });
      }

      const parentData = parentMap.get(linkedRequestId)!;
      parentData.countInMonth++;

      // Collect additional info (we'll use the first non-empty one) - skip for unassigned
      if (!isUnassigned(rawLinkedRequestId) && record.informacionAdicional && record.informacionAdicional.trim()) {
        parentData.additionalInfos.push(record.informacionAdicional);
      }
    }

    // Helper function to format date
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return '';
      try {
        // Try parsing as dd/MM/yyyy HH:mm format
        const parsed = DateTime.fromFormat(dateStr, 'dd/MM/yyyy HH:mm');
        if (parsed.isValid) {
          return parsed.toFormat('d-MMM-yyyy');
        }
        // Try parsing as ISO format
        const isoDate = DateTime.fromISO(dateStr);
        if (isoDate.isValid) {
          return isoDate.toFormat('d-MMM-yyyy');
        }
        return dateStr;
      } catch {
        return dateStr;
      }
    };

    // Build result array
    const totalIncidents = filteredResults.length;
    const data: BugsByParentRow[] = [];

    for (const [linkedRequestId, info] of parentMap) {
      // Handle unassigned row specially
      if (linkedRequestId === UNASSIGNED_KEY) {
        data.push({
          createdDate: '',
          linkedRequestId: '',
          linkedRequestIdLink: null,
          additionalInfo: 'To be evaluated',
          totalLinkedTickets: 0,
          linkedTicketsInMonth: info.countInMonth,
          requestStatus: '',
          eta: '',
        });
        continue;
      }

      // Look up parent ticket info from weekly_correctives first, then problems
      let createdDate = '';
      let eta = '';
      let requestStatus = '';

      const corrective = correctivesMapBugs.get(linkedRequestId);
      if (corrective) {
        createdDate = formatDate(corrective.createdTime);
        eta = formatDate(corrective.eta || '');
        requestStatus = corrective.requestStatus || '';
      } else {
        // Try problems table
        const problem = problemsMapBugs.get(linkedRequestId);
        if (problem) {
          createdDate = formatDate(problem.createdTime);
          eta = formatDate(problem.dueByTime || '');
          requestStatus = problem.requestStatus || '';
        }
      }

      // Get total linked tickets count (all time)
      const totalLinkedTickets = linkedCountMap.get(linkedRequestId) || 0;

      // Use the first additional info found
      const additionalInfo = info.additionalInfos.length > 0 ? info.additionalInfos[0] : '';

      data.push({
        createdDate,
        linkedRequestId,
        linkedRequestIdLink: info.linkedRequestIdLink,
        additionalInfo,
        totalLinkedTickets,
        linkedTicketsInMonth: info.countInMonth,
        requestStatus,
        eta,
      });
    }

    // Sort by createdDate descending (most recent first), empty dates at end
    data.sort((a, b) => {
      // Empty dates go after non-empty dates
      if (!a.createdDate && !b.createdDate) return 0;
      if (!a.createdDate) return 1;
      if (!b.createdDate) return -1;

      // Parse dates and compare
      const dateA = DateTime.fromFormat(a.createdDate, 'd-MMM-yyyy');
      const dateB = DateTime.fromFormat(b.createdDate, 'd-MMM-yyyy');

      if (!dateA.isValid && !dateB.isValid) return 0;
      if (!dateA.isValid) return 1;
      if (!dateB.isValid) return -1;

      return dateB.toMillis() - dateA.toMillis(); // Descending
    });

    // Move unassigned row (empty linkedRequestId) to end
    const unassignedIndex = data.findIndex(row => row.linkedRequestId === '');
    if (unassignedIndex !== -1) {
      const [unassignedRow] = data.splice(unassignedIndex, 1);
      data.push(unassignedRow);
    }

    return { data, monthName, totalIncidents };
  }

  async findIncidentsByDay(app?: string): Promise<IncidentsByDayResult> {
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

    // Deduplicate by requestId
    const seenRequestIds = new Set<number>();
    const uniqueResults = queryResults.filter((r) => {
      if (seenRequestIds.has(r.monthlyReport.requestId)) {
        return false;
      }
      seenRequestIds.add(r.monthlyReport.requestId);
      return true;
    });

    // Filter by app if provided
    const filteredResults = app && app !== 'all'
      ? uniqueResults.filter((r) => r.registeredAppCode === app)
      : uniqueResults;

    // Group by day of month
    const dayCountMap = new Map<number, number>();

    for (const result of filteredResults) {
      const createdDate = DateTime.fromJSDate(result.monthlyReport.createdTime);
      if (!createdDate.isValid) continue;

      const day = createdDate.day;
      dayCountMap.set(day, (dayCountMap.get(day) || 0) + 1);
    }

    // Convert to array and sort ascending by day
    const data: IncidentsByDayRow[] = Array.from(dayCountMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day - b.day);

    return {
      data,
      totalIncidents: filteredResults.length,
    };
  }

  async findIncidentsByReleaseByDay(
    app?: string,
    month?: string,
  ): Promise<IncidentsByReleaseByDayResult> {
    // Get all monthly reports with application patterns
    const results = await this.db
      .select({
        requestId: monthlyReports.requestId,
        aplicativos: monthlyReports.aplicativos,
        createdTime: monthlyReports.createdTime,
        categorizacion: monthlyReports.categorizacion,
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

    // Parse month filter (format: "2025-12")
    let targetYear: number | undefined;
    let targetMonth: number | undefined;
    if (month) {
      const parts = month.split('-').map(Number);
      targetYear = parts[0];
      targetMonth = parts[1];
    }

    // Filter results by app
    let filteredResults = results;
    if (app && app !== 'all') {
      filteredResults = results.filter((r) => r.registeredAppCode === app);
    }

    // Filter by month if provided
    if (targetYear && targetMonth) {
      filteredResults = filteredResults.filter((row) => {
        if (!row.createdTime) return false;
        const createdDate = DateTime.fromJSDate(row.createdTime);
        return createdDate.year === targetYear && createdDate.month === targetMonth;
      });
    }

    // Deduplicate by requestId (LEFT JOIN can create duplicates when aplicativos matches multiple patterns)
    const uniqueResults = Array.from(
      new Map(filteredResults.map(r => [r.requestId, r])).values()
    );

    // Group by day and count total + Error por Cambio
    const dayMap = new Map<
      number,
      { total: number; errorPorCambio: number }
    >();

    for (const row of uniqueResults) {
      if (!row.createdTime) continue;

      const createdDate = DateTime.fromJSDate(row.createdTime);
      const day = createdDate.day;

      if (!dayMap.has(day)) {
        dayMap.set(day, { total: 0, errorPorCambio: 0 });
      }

      const dayData = dayMap.get(day)!;
      dayData.total++;

      if (row.categorizacion === 'Error por Cambio') {
        dayData.errorPorCambio++;
      }
    }

    // Get Spanish month abbreviation
    const spanishMonthAbbreviations = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    const monthAbbr = targetMonth
      ? spanishMonthAbbreviations[targetMonth - 1]
      : 'Mes';

    // Convert to array, filter only days with Error por Cambio, and sort ascending by day
    const data: IncidentsByReleaseByDayRow[] = Array.from(dayMap.entries())
      .filter(([, counts]) => counts.errorPorCambio > 0)
      .map(([day, counts]) => ({
        day,
        dayLabel: `${monthAbbr} ${day}`,
        incidents: counts.total - counts.errorPorCambio,
        errorPorCambioCount: counts.errorPorCambio,
        total: counts.total,
      }))
      .sort((a, b) => a.day - b.day);

    return {
      data,
      monthName: monthAbbr,
    };
  }

  async findChangeReleaseByModule(
    app?: string,
    month?: string,
  ): Promise<ChangeReleaseByModuleResult> {
    // Get all monthly reports with application patterns and module registry
    const results = await this.db
      .select({
        requestId: monthlyReports.requestId,
        modulo: monthlyReports.modulo,
        createdTime: monthlyReports.createdTime,
        categorizacion: monthlyReports.categorizacion,
        registeredAppCode: applicationRegistry.code,
        moduleDisplayValue: moduleRegistry.displayValue,
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

    // Parse month filter (format: "2025-12")
    let targetYear: number | undefined;
    let targetMonth: number | undefined;
    if (month) {
      const parts = month.split('-').map(Number);
      targetYear = parts[0];
      targetMonth = parts[1];
    }

    // Filter results by app
    let filteredResults = results;
    if (app && app !== 'all') {
      filteredResults = results.filter((r) => r.registeredAppCode === app);
    }

    // Filter by month if provided
    if (targetYear && targetMonth) {
      filteredResults = filteredResults.filter((row) => {
        if (!row.createdTime) return false;
        const createdDate = DateTime.fromJSDate(row.createdTime);
        return createdDate.year === targetYear && createdDate.month === targetMonth;
      });
    }

    // Filter only "Error por Cambio" incidents
    filteredResults = filteredResults.filter(
      (row) => row.categorizacion === 'Error por Cambio'
    );

    // Deduplicate by requestId
    const uniqueResults = Array.from(
      new Map(filteredResults.map(r => [r.requestId, r])).values()
    );

    // Group by module and count
    const moduleMap = new Map<string, { count: number; displayValue: string | null }>();

    for (const row of uniqueResults) {
      const modulo = row.modulo || 'Unknown';

      if (!moduleMap.has(modulo)) {
        moduleMap.set(modulo, { count: 0, displayValue: row.moduleDisplayValue });
      }

      moduleMap.get(modulo)!.count++;
    }

    // Get Spanish month abbreviation
    const spanishMonthAbbreviations = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
    ];
    const monthAbbr = targetMonth
      ? spanishMonthAbbreviations[targetMonth - 1]
      : 'Mes';

    // Convert to array and sort by count descending
    const data: ChangeReleaseByModuleRow[] = Array.from(moduleMap.entries())
      .map(([modulo, info]) => ({
        moduleSourceValue: modulo,
        moduleDisplayValue: info.displayValue,
        incidents: info.count,
      }))
      .sort((a, b) => b.incidents - a.incidents);

    return {
      data,
      monthName: monthAbbr,
    };
  }
}
