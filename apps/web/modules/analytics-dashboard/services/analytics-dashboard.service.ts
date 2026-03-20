/**
 * Analytics Dashboard service.
 *
 * Phase 0: All methods use raw fetch() with manual JSend unwrapping.
 * Each section migration will convert its methods to apiClient + parseJsendData + Zod schemas.
 */
import type {
  WarRoom,
  MonthlyReport,
  ModuleEvolutionResponse,
  StabilityIndicatorsResponse,
  CategoryDistributionResponse,
  BusinessFlowPriorityResponse,
  PriorityByAppResponse,
  L3TicketsByStatusResponse,
  IncidentsByWeekResponse,
  IncidentsByDayResponse,
  IncidentOverviewByCategoryResponse,
  L3SummaryResponse,
  L3RequestsByStatusResponse,
  MissingScopeByParentResponse,
  BugsByParentResponse,
  SessionsOrdersLast30DaysResponse,
  IncidentsVsOrdersByMonthResponse,
  IncidentsByReleaseByDayResponse,
  ChangeReleaseByModuleResponse,
} from '@/modules/analytics-dashboard/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/** Helper: build query string from app + month filters */
function buildAppMonthParams(app: string, month: string): string {
  const params = new URLSearchParams();
  if (app !== 'all') params.set('app', app);
  if (month) params.set('month', month);
  return params.toString();
}

/** Helper: fetch JSON from API and unwrap JSend .data */
async function fetchJsendData<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (response.ok) {
      const result = await response.json();
      return (result.data ?? result) as T;
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return null;
  }
}

export const analyticsDashboardService = {
  getWarRooms: async (app: string, month: string): Promise<WarRoom[]> => {
    const qs = buildAppMonthParams(app, month);
    const data = await fetchJsendData<{ data: WarRoom[] }>(`${API_BASE_URL}/war-rooms/analytics?${qs}`);
    return data?.data ?? [];
  },

  getCriticalIncidents: async (app: string, month: string): Promise<MonthlyReport[]> => {
    const qs = buildAppMonthParams(app, month);
    const data = await fetchJsendData<MonthlyReport[]>(`${API_BASE_URL}/monthly-report/analytics?${qs}`);
    return data ?? [];
  },

  getModuleEvolution: async (app: string, startDate: string, endDate: string): Promise<ModuleEvolutionResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    params.set('startDate', startDate);
    params.set('endDate', endDate);
    return fetchJsendData<ModuleEvolutionResponse>(`${API_BASE_URL}/monthly-report/module-evolution?${params.toString()}`);
  },

  getModuleEvolutionMonthly: async (app: string, endDate: string): Promise<ModuleEvolutionResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    params.set('endDate', endDate);
    return fetchJsendData<ModuleEvolutionResponse>(`${API_BASE_URL}/monthly-report/module-evolution?${params.toString()}`);
  },

  getStabilityIndicators: async (app: string, month: string): Promise<StabilityIndicatorsResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<StabilityIndicatorsResponse>(`${API_BASE_URL}/monthly-report/stability-indicators?${qs}`);
  },

  getCategoryDistribution: async (app: string, month: string): Promise<CategoryDistributionResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<CategoryDistributionResponse>(`${API_BASE_URL}/monthly-report/category-distribution?${qs}`);
  },

  getBusinessFlowPriority: async (app: string, month: string): Promise<BusinessFlowPriorityResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<BusinessFlowPriorityResponse>(`${API_BASE_URL}/monthly-report/business-flow-priority?${qs}`);
  },

  getPriorityByApp: async (app: string, month: string): Promise<PriorityByAppResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<PriorityByAppResponse>(`${API_BASE_URL}/monthly-report/priority-by-app?${qs}`);
  },

  getL3TicketsByStatus: async (app: string): Promise<L3TicketsByStatusResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    return fetchJsendData<L3TicketsByStatusResponse>(`${API_BASE_URL}/weekly-corrective/l3-tickets-by-status?${params.toString()}`);
  },

  getIncidentsByWeek: async (app: string, year: number): Promise<IncidentsByWeekResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    params.set('year', year.toString());
    return fetchJsendData<IncidentsByWeekResponse>(`${API_BASE_URL}/monthly-report/incidents-by-week?${params.toString()}`);
  },

  getIncidentsByDay: async (app: string): Promise<IncidentsByDayResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    return fetchJsendData<IncidentsByDayResponse>(`${API_BASE_URL}/monthly-report/incidents-by-day?${params.toString()}`);
  },

  getIncidentOverview: async (app: string, startDate: string, endDate: string): Promise<IncidentOverviewByCategoryResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    return fetchJsendData<IncidentOverviewByCategoryResponse>(`${API_BASE_URL}/monthly-report/incident-overview-by-category?${params.toString()}`);
  },

  getIncidentOverviewMonthly: async (app: string, endDate: string): Promise<IncidentOverviewByCategoryResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    params.set('endDate', endDate);
    return fetchJsendData<IncidentOverviewByCategoryResponse>(`${API_BASE_URL}/monthly-report/incident-overview-by-category?${params.toString()}`);
  },

  getL3Summary: async (app: string): Promise<L3SummaryResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    return fetchJsendData<L3SummaryResponse>(`${API_BASE_URL}/monthly-report/l3-summary?${params.toString()}`);
  },

  getL3RequestsByStatus: async (app: string): Promise<L3RequestsByStatusResponse | null> => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    return fetchJsendData<L3RequestsByStatusResponse>(`${API_BASE_URL}/monthly-report/l3-requests-by-status?${params.toString()}`);
  },

  getMissingScopeByParent: async (app: string, month: string): Promise<MissingScopeByParentResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<MissingScopeByParentResponse>(`${API_BASE_URL}/monthly-report/missing-scope-by-parent?${qs}`);
  },

  getBugsByParent: async (app: string, month: string): Promise<BugsByParentResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<BugsByParentResponse>(`${API_BASE_URL}/monthly-report/bugs-by-parent?${qs}`);
  },

  getSessionsOrdersLast30Days: async (): Promise<SessionsOrdersLast30DaysResponse | null> => {
    return fetchJsendData<SessionsOrdersLast30DaysResponse>(`${API_BASE_URL}/sessions-orders/last-30-days`);
  },

  getIncidentsVsOrdersByMonth: async (year: number): Promise<IncidentsVsOrdersByMonthResponse | null> => {
    return fetchJsendData<IncidentsVsOrdersByMonthResponse>(`${API_BASE_URL}/sessions-orders/incidents-vs-orders-by-month?year=${year}`);
  },

  getIncidentsByReleaseByDay: async (app: string, month: string): Promise<IncidentsByReleaseByDayResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<IncidentsByReleaseByDayResponse>(`${API_BASE_URL}/monthly-report/incidents-by-release-by-day?${qs}`);
  },

  getChangeReleaseByModule: async (app: string, month: string): Promise<ChangeReleaseByModuleResponse | null> => {
    const qs = buildAppMonthParams(app, month);
    return fetchJsendData<ChangeReleaseByModuleResponse>(`${API_BASE_URL}/monthly-report/change-release-by-module?${qs}`);
  },
};
