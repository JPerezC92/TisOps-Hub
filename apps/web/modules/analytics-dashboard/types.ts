/**
 * Analytics Dashboard types.
 * These are temporary local interfaces — they will be replaced by Zod schemas
 * in @repo/reports as each section is migrated to parseJsendData.
 */

export interface MonthlyReport {
  requestId: number;
  requestIdLink?: string;
  aplicativos: string;
  categorizacion: string;
  createdTime: string;
  requestStatus: string;
  modulo: string;
  subject: string;
  priority: string;
  eta: string;
  informacionAdicional: string;
  resolvedTime: string;
  paisesAfectados: string;
  recurrencia: string;
  technician: string;
  jira: string;
  problemId: string;
  linkedRequestId: string;
  requestOlaStatus: string;
  grupoEscalamiento: string;
  aplicactivosAfectados: string;
  nivelUno: string;
  campana: string;
  cuv: string;
  release: string;
  rca: string;
  mappedModuleDisplayValue?: string | null;
  mappedStatusDisplayValue?: string | null;
  mappedCategorizationDisplayValue?: string | null;
}

export interface WarRoom {
  requestId: number;
  requestIdLink: string;
  application: string;
  date: string;
  summary: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  participants: number;
  status: string;
  notes: string;
  rcaStatus: string;
  urlRca: string;
  app?: {
    id: number;
    code: string;
    name: string;
  } | null;
}

export interface Application {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

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
  categorizationSourceValue: string;
  categorizationDisplayValue: string | null;
  count: number;
  percentage: number;
  tickets: TicketDetail[];
}

export interface ModuleEvolution {
  moduleSourceValue: string;
  moduleDisplayValue: string | null;
  count: number;
  percentage: number;
  categorizations: CategorizationDetail[];
}

export interface ModuleEvolutionResponse {
  data: ModuleEvolution[];
  total: number;
}

export interface RequestIdWithLink {
  requestId: number;
  requestIdLink?: string;
}

export interface TicketGroup {
  key: string;
  count: number;
  requestIds: RequestIdWithLink[];
  parentTicketId: string;
  linkedTicketsCount: number;
  additionalInfo: string;
  displayStatus: string;
  isUnmapped: boolean;
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

export interface StabilityIndicatorsResponse {
  data: StabilityIndicatorRow[];
  hasUnmappedStatuses: boolean;
}

export interface UnassignedRecurrencyRequest {
  requestId: number;
  requestIdLink?: string;
  rawRecurrency: string;
}

export interface CategoryDistributionRow {
  categorySourceValue: string;
  categoryDisplayValue: string | null;
  recurringCount: number;
  newCount: number;
  unassignedCount: number;
  unassignedRequests: UnassignedRecurrencyRequest[];
  total: number;
  percentage: number;
}

export interface CategoryDistributionResponse {
  data: CategoryDistributionRow[];
  monthName: string;
  totalIncidents: number;
}

export interface ModuleCount {
  moduleSourceValue: string;
  moduleDisplayValue: string | null;
  count: number;
}

export interface PriorityBreakdown {
  priority: string;
  totalCount: number;
  modules: ModuleCount[];
}

export interface BusinessFlowPriorityResponse {
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

export interface PriorityByAppResponse {
  data: PriorityByAppRow[];
  monthName: string;
  totalIncidents: number;
}

export interface L3TicketsByStatusRow {
  application: string;
  statusCounts: Record<string, number>;
  total: number;
}

export interface L3TicketsByStatusResponse {
  data: L3TicketsByStatusRow[];
  statusColumns: string[];
  monthName: string;
  totalL3Tickets: number;
}

export interface IncidentsByWeekRow {
  weekNumber: number;
  year: number;
  count: number;
  startDate: string;
  endDate: string;
}

export interface IncidentsByWeekResponse {
  data: IncidentsByWeekRow[];
  year: number;
  totalIncidents: number;
}

export interface IncidentsByDayRow {
  day: number;
  count: number;
}

export interface IncidentsByDayResponse {
  data: IncidentsByDayRow[];
  totalIncidents: number;
}

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

export interface IncidentOverviewByCategoryResponse {
  resolvedInL2: IncidentOverviewCard;
  pending: IncidentOverviewCard;
  recurrentInL2L3: IncidentOverviewCard;
  assignedToL3Backlog: IncidentOverviewCard;
  l3Status: L3StatusCard;
}

export interface L3SummaryRow {
  status: string;
  statusLabel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface L3SummaryResponse {
  data: L3SummaryRow[];
  totals: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

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

export interface L3RequestsByStatusResponse {
  devInProgress: L3RequestDetail[];
  inBacklog: L3RequestDetail[];
  inTesting: L3RequestDetail[];
  prdDeployment: L3RequestDetail[];
}

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

export interface MissingScopeByParentResponse {
  data: MissingScopeByParentRow[];
  monthName: string;
  totalIncidents: number;
}

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

export interface BugsByParentResponse {
  data: BugsByParentRow[];
  monthName: string;
  totalIncidents: number;
}

export interface SessionsOrdersLast30DaysRow {
  day: string;
  date: string;
  incidents: number;
  sessions: number;
  placedOrders: number;
}

export interface SessionsOrdersLast30DaysResponse {
  data: SessionsOrdersLast30DaysRow[];
}

export interface IncidentsVsOrdersByMonthRow {
  month: string;
  monthNumber: number;
  incidents: number;
  placedOrders: number;
}

export interface IncidentsVsOrdersByMonthResponse {
  data: IncidentsVsOrdersByMonthRow[];
}

export interface IncidentsByReleaseByDayRow {
  day: number;
  dayLabel: string;
  incidents: number;
  errorPorCambioCount: number;
  total: number;
}

export interface IncidentsByReleaseByDayResponse {
  data: IncidentsByReleaseByDayRow[];
  monthName: string;
}

export interface ChangeReleaseByModuleRow {
  moduleSourceValue: string;
  moduleDisplayValue: string | null;
  incidents: number;
}

export interface ChangeReleaseByModuleResponse {
  data: ChangeReleaseByModuleRow[];
  monthName: string;
}

/** Filter state shared across all dashboard sections */
export interface AnalyticsFilters {
  selectedApp: string;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  isMonthlyMode: boolean;
  lastDayOfMonth: string;
}
