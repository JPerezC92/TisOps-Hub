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

// Incidents by Day interfaces
export interface IncidentsByDayRow {
  day: number;     // Day of month (1-31)
  count: number;
}

export interface IncidentsByDayResult {
  data: IncidentsByDayRow[];
  totalIncidents: number;
}

// Incident Overview by Category interfaces
export interface IncidentOverviewItem {
  category: string;
  categoryDisplayValue: string | null;
  count: number;
  percentage: number;
}

export interface IncidentOverviewCard {
  data: IncidentOverviewItem[];
  total: number;
}

export interface L3StatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface L3StatusCard {
  data: L3StatusItem[];
  total: number;
}

export interface IncidentOverviewByCategoryResult {
  resolvedInL2: IncidentOverviewCard;
  pending: IncidentOverviewCard;
  recurrentInL2L3: IncidentOverviewCard;
  assignedToL3Backlog: IncidentOverviewCard;
  l3Status: L3StatusCard;
}

// L3 Summary interfaces
export interface L3SummaryRow {
  status: string;
  statusLabel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface L3SummaryResult {
  data: L3SummaryRow[];
  totals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

// L3 Requests by Status interfaces
export interface L3RequestDetail {
  requestId: string;
  requestIdLink?: string;
  createdTime: string;
  modulo: string;
  subject: string;
  priority: string;
  priorityEnglish: string;
  linkedTicketsCount: number;
  eta: string;
}

export interface L3RequestsByStatusResult {
  devInProgress: L3RequestDetail[];
  inBacklog: L3RequestDetail[];
  inTesting: L3RequestDetail[];
  prdDeployment: L3RequestDetail[];
}

// Missing Scope by Parent interfaces
export interface MissingScopeByParentRow {
  createdDate: string;
  linkedRequestId: string;
  linkedRequestIdLink: string | null;
  additionalInfo: string;
  totalLinkedTickets: number;
  linkedTicketsInMonth: number;
  requestStatus: string;
  eta: string;
}

export interface MissingScopeByParentResult {
  data: MissingScopeByParentRow[];
  monthName: string;
  totalIncidents: number;
}

// Bugs by Parent interfaces
export interface BugsByParentRow {
  createdDate: string;
  linkedRequestId: string;
  linkedRequestIdLink: string | null;
  additionalInfo: string;
  totalLinkedTickets: number;
  linkedTicketsInMonth: number;
  requestStatus: string;
  eta: string;
}

export interface BugsByParentResult {
  data: BugsByParentRow[];
  monthName: string;
  totalIncidents: number;
}

// Critical Incidents with mapping interface
export interface CriticalIncidentWithMapping {
  monthlyReport: MonthlyReport;
  mappedModuleDisplayValue: string | null;
  mappedStatusDisplayValue: string | null;
  mappedCategorizationDisplayValue: string | null;
}

export interface IMonthlyReportRepository {
  findAll(): Promise<MonthlyReport[]>;
  countAll(): Promise<number>;
  bulkCreate(records: InsertMonthlyReport[]): Promise<void>;
  deleteAll(): Promise<number>;
  findCriticalIncidentsFiltered(app?: string, month?: string): Promise<CriticalIncidentWithMapping[]>;
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
  findIncidentOverviewByCategory(
    app?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<IncidentOverviewByCategoryResult>;
  findL3Summary(
    app?: string,
  ): Promise<L3SummaryResult>;
  findL3RequestsByStatus(
    app?: string,
  ): Promise<L3RequestsByStatusResult>;
  findMissingScopeByParent(
    app?: string,
    month?: string,
  ): Promise<MissingScopeByParentResult>;
  findBugsByParent(
    app?: string,
    month?: string,
  ): Promise<BugsByParentResult>;
  findIncidentsByDay(
    app?: string,
  ): Promise<IncidentsByDayResult>;
}
