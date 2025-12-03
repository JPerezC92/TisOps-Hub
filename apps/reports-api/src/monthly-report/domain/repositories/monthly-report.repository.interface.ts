import { MonthlyReport, InsertMonthlyReport } from '@repo/database';

export const MONTHLY_REPORT_REPOSITORY = Symbol('MONTHLY_REPORT_REPOSITORY');

export interface TicketDetail {
  subject: string;
  requestId: number;
  requestIdLink?: string;
  parentTicketId: string;
  linkedTicketsCount: number;
  additionalInfo: string;
  displayStatus: string;
  isUnmapped: boolean;
}

export interface CategorizationDetail {
  categorizationSourceValue: string;        // Original value from data
  categorizationDisplayValue: string | null; // Mapped display value
  count: number;
  percentage: number;
  tickets: TicketDetail[];
}

export interface ModuleEvolutionResult {
  moduleSourceValue: string;        // Original value from data
  moduleDisplayValue: string | null; // Mapped display value
  count: number;
  percentage: number;
  categorizations: CategorizationDetail[];
}

export interface UnmappedRequest {
  requestId: number;
  requestIdLink?: string;
  rawStatus: string;
}

export interface StabilityIndicatorRow {
  application: string;
  l2Count: number;
  l3Count: number;
  unmappedCount: number;
  unmappedRequests: UnmappedRequest[];
  total: number;
}

export interface StabilityIndicatorsResult {
  data: StabilityIndicatorRow[];
  hasUnmappedStatuses: boolean;
}

export interface UnassignedRecurrencyRequest {
  requestId: number;
  requestIdLink?: string;
  rawRecurrency: string;
}

export interface CategoryDistributionRow {
  categorySourceValue: string;        // Original value from data (e.g., "Error de codificación (Bug)")
  categoryDisplayValue: string | null; // Mapped display value (e.g., "Bugs")
  recurringCount: number;
  newCount: number;
  unassignedCount: number;
  unassignedRequests: UnassignedRecurrencyRequest[];
  total: number;
  percentage: number;
}

export interface CategoryDistributionResult {
  data: CategoryDistributionRow[];
  monthName: string;
  totalIncidents: number;
}

export interface ModuleCount {
  moduleSourceValue: string;        // Original value from data
  moduleDisplayValue: string | null; // Mapped display value
  count: number;
}

export interface PriorityBreakdown {
  priority: string;
  totalCount: number;
  modules: ModuleCount[];
}

export interface BusinessFlowPriorityResult {
  data: PriorityBreakdown[];
  monthName: string;
  totalIncidents: number;
}

export interface PriorityByAppRow {
  application: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  total: number;
}

export interface PriorityByAppResult {
  data: PriorityByAppRow[];
  monthName: string;
  totalIncidents: number;
}

export interface IncidentsByWeekRow {
  weekNumber: number;
  year: number;
  count: number;
  startDate: string;
  endDate: string;
}

export interface IncidentsByWeekResult {
  data: IncidentsByWeekRow[];
  year: number;
  totalIncidents: number;
}

export interface IMonthlyReportRepository {
  findAll(): Promise<MonthlyReport[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertMonthlyReport[]): Promise<void>;
  deleteAll(): Promise<number>;
  findCriticalIncidentsFiltered(app?: string, month?: string): Promise<MonthlyReport[]>;
  findModuleEvolution(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<ModuleEvolutionResult[]>;
  findStabilityIndicators(
    app?: string,
    month?: string,
  ): Promise<StabilityIndicatorsResult>;
  findCategoryDistribution(
    app?: string,
    month?: string,
  ): Promise<CategoryDistributionResult>;
  findBusinessFlowByPriority(
    app?: string,
    month?: string,
  ): Promise<BusinessFlowPriorityResult>;
  findPriorityByApp(
    app?: string,
    month?: string,
  ): Promise<PriorityByAppResult>;
  findIncidentsByWeek(
    app?: string,
    year?: number,
  ): Promise<IncidentsByWeekResult>;
}
