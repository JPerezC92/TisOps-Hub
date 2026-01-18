'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DateTime } from 'luxon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Priority } from '@repo/reports/frontend';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';

interface MonthlyReport {
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

interface WarRoom {
  requestId: number;
  requestIdLink: string;
  application: string;
  date: string; // ISO string from API
  summary: string;
  startTime: string; // ISO string from API
  durationMinutes: number;
  endTime: string; // ISO string from API
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

interface Application {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface TicketDetail {
  subject: string;
  requestId: number;
  requestIdLink?: string;
  parentTicketId: string;
  linkedTicketsCount: number;
  additionalInfo: string;
  displayStatus: string;
  isUnmapped: boolean;
}

interface CategorizationDetail {
  categorizationSourceValue: string;
  categorizationDisplayValue: string | null;
  count: number;
  percentage: number;
  tickets: TicketDetail[];
}

interface ModuleEvolution {
  moduleSourceValue: string;
  moduleDisplayValue: string | null;
  count: number;
  percentage: number;
  categorizations: CategorizationDetail[];
}

interface ModuleEvolutionResponse {
  data: ModuleEvolution[];
  total: number;
}

interface RequestIdWithLink {
  requestId: number;
  requestIdLink?: string;
}

interface TicketGroup {
  key: string;
  count: number;
  requestIds: RequestIdWithLink[];
  parentTicketId: string;
  linkedTicketsCount: number;
  additionalInfo: string;
  displayStatus: string;
  isUnmapped: boolean;
}

interface UnmappedRequest {
  requestId: number;
  requestIdLink?: string;
  rawStatus: string;
}

interface StabilityIndicatorRow {
  application: string;
  l2Count: number;
  l3Count: number;
  unmappedCount: number;
  unmappedRequests: UnmappedRequest[];
  total: number;
}

interface StabilityIndicatorsResponse {
  data: StabilityIndicatorRow[];
  hasUnmappedStatuses: boolean;
}

interface UnassignedRecurrencyRequest {
  requestId: number;
  requestIdLink?: string;
  rawRecurrency: string;
}

interface CategoryDistributionRow {
  categorySourceValue: string;        // Original value from data
  categoryDisplayValue: string | null; // Mapped display value
  recurringCount: number;
  newCount: number;
  unassignedCount: number;
  unassignedRequests: UnassignedRecurrencyRequest[];
  total: number;
  percentage: number;
}

interface CategoryDistributionResponse {
  data: CategoryDistributionRow[];
  monthName: string;
  totalIncidents: number;
}

interface ModuleCount {
  moduleSourceValue: string;        // Original value from data
  moduleDisplayValue: string | null; // Mapped display value
  count: number;
}

interface PriorityBreakdown {
  priority: string;
  totalCount: number;
  modules: ModuleCount[];
}

interface BusinessFlowPriorityResponse {
  data: PriorityBreakdown[];
  monthName: string;
  totalIncidents: number;
}

interface PriorityByAppRow {
  application: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  total: number;
}

interface PriorityByAppResponse {
  data: PriorityByAppRow[];
  monthName: string;
  totalIncidents: number;
}

interface L3TicketsByStatusRow {
  application: string;
  statusCounts: Record<string, number>;
  total: number;
}

interface L3TicketsByStatusResponse {
  data: L3TicketsByStatusRow[];
  statusColumns: string[];
  monthName: string;
  totalL3Tickets: number;
}

interface IncidentsByWeekRow {
  weekNumber: number;
  year: number;
  count: number;
  startDate: string;
  endDate: string;
}

interface IncidentsByWeekResponse {
  data: IncidentsByWeekRow[];
  year: number;
  totalIncidents: number;
}

// Incidents by Day interfaces
interface IncidentsByDayRow {
  day: number;
  count: number;
}

interface IncidentsByDayResponse {
  data: IncidentsByDayRow[];
  totalIncidents: number;
}

// Incident Overview by Category interfaces
interface IncidentOverviewItem {
  category: string;
  categoryDisplayValue: string | null;
  count: number;
  percentage: number;
}

interface IncidentOverviewCard {
  data: IncidentOverviewItem[];
  total: number;
}

interface L3StatusItem {
  status: string;
  count: number;
  percentage: number;
}

interface L3StatusCard {
  data: L3StatusItem[];
  total: number;
}

interface IncidentOverviewByCategoryResponse {
  resolvedInL2: IncidentOverviewCard;
  pending: IncidentOverviewCard;
  recurrentInL2L3: IncidentOverviewCard;
  assignedToL3Backlog: IncidentOverviewCard;
  l3Status: L3StatusCard;
}

// L3 Summary interfaces
interface L3SummaryRow {
  status: string;
  statusLabel: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

interface L3SummaryResponse {
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
interface L3RequestDetail {
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

interface L3RequestsByStatusResponse {
  devInProgress: L3RequestDetail[];
  inBacklog: L3RequestDetail[];
  inTesting: L3RequestDetail[];
  prdDeployment: L3RequestDetail[];
}

// Missing Scope by Parent interfaces
interface MissingScopeByParentRow {
  createdDate: string;
  linkedRequestId: string;
  linkedRequestIdLink: string | null;
  additionalInfo: string;
  totalLinkedTickets: number;
  linkedTicketsInMonth: number;
  requestStatus: string;
  eta: string;
}

interface MissingScopeByParentResponse {
  data: MissingScopeByParentRow[];
  monthName: string;
  totalIncidents: number;
}

// Bugs by Parent interfaces
interface BugsByParentRow {
  createdDate: string;
  linkedRequestId: string;
  linkedRequestIdLink: string | null;
  additionalInfo: string;
  totalLinkedTickets: number;
  linkedTicketsInMonth: number;
  requestStatus: string;
  eta: string;
}

interface BugsByParentResponse {
  data: BugsByParentRow[];
  monthName: string;
  totalIncidents: number;
}

// Sessions Orders Last 30 Days interfaces
interface SessionsOrdersLast30DaysRow {
  day: string;         // "Day 27"
  date: string;        // "2025-01-27"
  incidents: number;
  sessions: number;
  placedOrders: number;
}

interface SessionsOrdersLast30DaysResponse {
  data: SessionsOrdersLast30DaysRow[];
}

// Incidents vs Orders by Month interfaces
interface IncidentsVsOrdersByMonthRow {
  month: string;       // "Jan", "Feb", etc.
  monthNumber: number; // 1-12 for sorting
  incidents: number;
  placedOrders: number;
}

interface IncidentsVsOrdersByMonthResponse {
  data: IncidentsVsOrdersByMonthRow[];
}

// Incidents by Release by Day interfaces
interface IncidentsByReleaseByDayRow {
  day: number;
  dayLabel: string;
  incidents: number;        // Total - Error por Cambio
  errorPorCambioCount: number;
  total: number;
}

interface IncidentsByReleaseByDayResponse {
  data: IncidentsByReleaseByDayRow[];
  monthName: string;
}

// Change Release by Module interfaces
interface ChangeReleaseByModuleRow {
  moduleSourceValue: string;
  moduleDisplayValue: string | null;
  incidents: number;
}

interface ChangeReleaseByModuleResponse {
  data: ChangeReleaseByModuleRow[];
  monthName: string;
}

// Group tickets by parentTicketId (if exists) or displayStatus
function groupTickets(tickets: TicketDetail[]): TicketGroup[] {
  const groups = new Map<string, TicketGroup>();

  for (const ticket of tickets) {
    const hasParent = ticket.parentTicketId && ticket.parentTicketId !== 'No asignado' && ticket.parentTicketId !== '0';
    const key = hasParent ? ticket.parentTicketId : ticket.displayStatus;

    if (groups.has(key)) {
      const group = groups.get(key)!;
      group.count++;
      group.requestIds.push({ requestId: ticket.requestId, requestIdLink: ticket.requestIdLink });
      // Note: linkedTicketsCount is already set from the first ticket - don't sum it
      // because it represents the total children for the parent, not a per-ticket count
    } else {
      groups.set(key, {
        key,
        count: 1,
        requestIds: [{ requestId: ticket.requestId, requestIdLink: ticket.requestIdLink }],
        parentTicketId: ticket.parentTicketId,
        linkedTicketsCount: ticket.linkedTicketsCount,
        additionalInfo: ticket.additionalInfo,
        displayStatus: ticket.displayStatus,
        isUnmapped: ticket.isUnmapped,
      });
    }
  }

  return Array.from(groups.values());
}

// Get default date range: Last Friday to Last Thursday
function getDefaultDateRange() {
  const today = DateTime.now();
  let lastThursday = today.set({ weekday: 4 }); // Luxon: 4 = Thursday
  if (lastThursday >= today) {
    lastThursday = lastThursday.minus({ weeks: 1 });
  }
  const lastFriday = lastThursday.minus({ days: 6 });
  return {
    startDate: lastFriday.toFormat('yyyy-MM-dd'),
    endDate: lastThursday.toFormat('yyyy-MM-dd'),
  };
}

// Date/Time Formatting Utilities using Luxon
function formatDate(timestamp: number | string): string {
  if (!timestamp) return 'N/A';
  // Handle both ISO string and milliseconds
  const date = typeof timestamp === 'string'
    ? DateTime.fromISO(timestamp)
    : DateTime.fromMillis(timestamp);
  return date.toFormat('MMM d'); // e.g., "Nov 4"
}

function formatTime(timestamp: number | string): string {
  if (!timestamp) return 'N/A';
  // Handle both ISO string and milliseconds
  const time = typeof timestamp === 'string'
    ? DateTime.fromISO(timestamp)
    : DateTime.fromMillis(timestamp);
  return time.toFormat('HH\'h\'mm'); // e.g., "14h30"
}

function formatDateTimeRange(date: number | string, startTime: number | string, endTime: number | string): string {
  const dateStr = formatDate(date);
  const startStr = formatTime(startTime);
  const endStr = formatTime(endTime);
  return `${dateStr} from ${startStr} to ${endStr}`;
}

function AnalyticsDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<WarRoom[]>([]);
  const [criticalIncidents, setCriticalIncidents] = useState<MonthlyReport[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [criticalIncidentsLoading, setCriticalIncidentsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);

  // Report Mode state (Weekly vs Monthly)
  const [isMonthlyMode, setIsMonthlyMode] = useState(false);

  // Evolution of Incidents state
  const [moduleEvolutionData, setModuleEvolutionData] = useState<ModuleEvolutionResponse | null>(null);
  const [moduleEvolutionLoading, setModuleEvolutionLoading] = useState(true);
  const [dateRangePickerOpen, setDateRangePickerOpen] = useState(false);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  // Modal state for ticket group details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRequestIds, setModalRequestIds] = useState<RequestIdWithLink[]>([]);
  const [modalGroupTitle, setModalGroupTitle] = useState('');

  // Stability Indicators state
  const [stabilityIndicators, setStabilityIndicators] = useState<StabilityIndicatorsResponse | null>(null);
  const [stabilityIndicatorsLoading, setStabilityIndicatorsLoading] = useState(true);
  const [unmappedModalOpen, setUnmappedModalOpen] = useState(false);
  const [unmappedModalData, setUnmappedModalData] = useState<UnmappedRequest[]>([]);
  const [unmappedModalApp, setUnmappedModalApp] = useState('');

  // Category Distribution state
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistributionResponse | null>(null);
  const [categoryDistributionLoading, setCategoryDistributionLoading] = useState(true);
  const [unassignedRecurrencyModalOpen, setUnassignedRecurrencyModalOpen] = useState(false);
  const [unassignedRecurrencyModalData, setUnassignedRecurrencyModalData] = useState<UnassignedRecurrencyRequest[]>([]);
  const [unassignedRecurrencyModalCategory, setUnassignedRecurrencyModalCategory] = useState('');
  const [showUnassignedColumn, setShowUnassignedColumn] = useState(false);

  // Business Flow Priority state
  const [businessFlowPriority, setBusinessFlowPriority] = useState<BusinessFlowPriorityResponse | null>(null);
  const [businessFlowPriorityLoading, setBusinessFlowPriorityLoading] = useState(true);

  // Priority by App state
  const [priorityByApp, setPriorityByApp] = useState<PriorityByAppResponse | null>(null);
  const [priorityByAppLoading, setPriorityByAppLoading] = useState(true);

  // L3 Tickets by Status state
  const [l3TicketsByStatus, setL3TicketsByStatus] = useState<L3TicketsByStatusResponse | null>(null);
  const [l3TicketsByStatusLoading, setL3TicketsByStatusLoading] = useState(true);

  // Incidents by Week state
  const [incidentsByWeek, setIncidentsByWeek] = useState<IncidentsByWeekResponse | null>(null);
  const [incidentsByWeekLoading, setIncidentsByWeekLoading] = useState(true);

  // Incidents by Day state
  const [incidentsByDay, setIncidentsByDay] = useState<IncidentsByDayResponse | null>(null);
  const [incidentsByDayLoading, setIncidentsByDayLoading] = useState(true);

  // Incident Overview by Category state
  const [incidentOverview, setIncidentOverview] = useState<IncidentOverviewByCategoryResponse | null>(null);
  const [incidentOverviewLoading, setIncidentOverviewLoading] = useState(true);

  // L3 Summary state
  const [l3Summary, setL3Summary] = useState<L3SummaryResponse | null>(null);
  const [l3SummaryLoading, setL3SummaryLoading] = useState(true);

  // L3 Requests by Status state
  const [l3RequestsByStatus, setL3RequestsByStatus] = useState<L3RequestsByStatusResponse | null>(null);
  const [l3RequestsByStatusLoading, setL3RequestsByStatusLoading] = useState(true);

  // Missing Scope by Parent state
  const [missingScopeByParent, setMissingScopeByParent] = useState<MissingScopeByParentResponse | null>(null);
  const [missingScopeByParentLoading, setMissingScopeByParentLoading] = useState(true);

  // Bugs by Parent state
  const [bugsByParent, setBugsByParent] = useState<BugsByParentResponse | null>(null);
  const [bugsByParentLoading, setBugsByParentLoading] = useState(true);

  // Sessions Orders Last 30 Days state
  const [sessionsOrdersData, setSessionsOrdersData] = useState<SessionsOrdersLast30DaysResponse | null>(null);
  const [sessionsOrdersLoading, setSessionsOrdersLoading] = useState(true);

  // Incidents vs Orders by Month state
  const [incidentsVsOrdersData, setIncidentsVsOrdersData] = useState<IncidentsVsOrdersByMonthResponse | null>(null);
  const [incidentsVsOrdersLoading, setIncidentsVsOrdersLoading] = useState(true);

  // Incidents by Release by Day state
  const [incidentsByReleaseByDayData, setIncidentsByReleaseByDayData] = useState<IncidentsByReleaseByDayResponse | null>(null);
  const [incidentsByReleaseByDayLoading, setIncidentsByReleaseByDayLoading] = useState(true);

  // Change Release by Module state
  const [changeReleaseByModuleData, setChangeReleaseByModuleData] = useState<ChangeReleaseByModuleResponse | null>(null);
  const [changeReleaseByModuleLoading, setChangeReleaseByModuleLoading] = useState(true);

  // Get filter values from URL parameters
  const selectedApp = searchParams.get('app') || 'all';
  const selectedMonth = searchParams.get('month') || DateTime.now().toFormat('yyyy-MM');

  // Get date range from URL or use default
  const defaultRange = getDefaultDateRange();
  const startDate = searchParams.get('startDate') || defaultRange.startDate;
  const endDate = searchParams.get('endDate') || defaultRange.endDate;

  // Parse selected month for picker
  const parts = selectedMonth.split('-').map(Number);
  const selectedYear = parts[0] ?? DateTime.now().year;
  const selectedMonthNum = parts[1] ?? DateTime.now().month;

  // Calculate last day of month for Monthly mode
  const lastDayOfMonth = DateTime.fromFormat(selectedMonth, 'yyyy-MM').endOf('month').toFormat('yyyy-MM-dd');

  // Update URL parameters - preserve existing date params when not explicitly provided
  const updateFilters = useCallback(
    (app: string, month: string, newStartDate?: string, newEndDate?: string) => {
      const params = new URLSearchParams();
      if (app !== 'all') params.set('app', app);
      if (month) params.set('month', month);

      // Preserve date params: use new values if provided, otherwise keep existing URL values
      const dateStart = newStartDate ?? searchParams.get('startDate');
      const dateEnd = newEndDate ?? searchParams.get('endDate');
      if (dateStart) params.set('startDate', dateStart);
      if (dateEnd) params.set('endDate', dateEnd);

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch applications for filter dropdown
  const fetchApplications = async () => {
    try {
      const response = await fetch('http://localhost:3000/application-registry', { cache: 'no-store' });
      if (response.ok) {
        const result = await response.json();
        setApplications(result || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  // Fetch filtered war rooms data
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/war-rooms/analytics?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch war rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch critical incidents from monthly reports
  const fetchCriticalIncidents = async () => {
    setCriticalIncidentsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/analytics?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setCriticalIncidents(result || []);
      }
    } catch (error) {
      console.error('Failed to fetch critical incidents:', error);
    } finally {
      setCriticalIncidentsLoading(false);
    }
  };

  // Fetch module evolution data
  const fetchModuleEvolution = async () => {
    setModuleEvolutionLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      // Monthly mode: only send endDate (last day of month)
      // Weekly mode: send both startDate and endDate
      if (isMonthlyMode) {
        params.set('endDate', lastDayOfMonth);
      } else {
        params.set('startDate', startDate);
        params.set('endDate', endDate);
      }

      const response = await fetch(
        `http://localhost:3000/monthly-report/module-evolution?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setModuleEvolutionData(result);
      }
    } catch (error) {
      console.error('Failed to fetch module evolution:', error);
    } finally {
      setModuleEvolutionLoading(false);
    }
  };

  // Fetch stability indicators
  const fetchStabilityIndicators = async () => {
    setStabilityIndicatorsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/stability-indicators?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setStabilityIndicators(result);
      }
    } catch (error) {
      console.error('Failed to fetch stability indicators:', error);
    } finally {
      setStabilityIndicatorsLoading(false);
    }
  };

  // Fetch category distribution
  const fetchCategoryDistribution = async () => {
    setCategoryDistributionLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/category-distribution?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setCategoryDistribution(result);
      }
    } catch (error) {
      console.error('Failed to fetch category distribution:', error);
    } finally {
      setCategoryDistributionLoading(false);
    }
  };

  // Fetch business flow priority
  const fetchBusinessFlowPriority = async () => {
    setBusinessFlowPriorityLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/business-flow-priority?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setBusinessFlowPriority(result);
      }
    } catch (error) {
      console.error('Failed to fetch business flow priority:', error);
    } finally {
      setBusinessFlowPriorityLoading(false);
    }
  };

  // Fetch priority by app
  const fetchPriorityByApp = async () => {
    setPriorityByAppLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/priority-by-app?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setPriorityByApp(result);
      }
    } catch (error) {
      console.error('Failed to fetch priority by app:', error);
    } finally {
      setPriorityByAppLoading(false);
    }
  };

  // Fetch L3 tickets by status (no month filter - shows all time)
  const fetchL3TicketsByStatus = async () => {
    setL3TicketsByStatusLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      // Note: No month filter for this endpoint - shows all time data

      const response = await fetch(
        `http://localhost:3000/weekly-corrective/l3-tickets-by-status?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setL3TicketsByStatus(result);
      }
    } catch (error) {
      console.error('Failed to fetch L3 tickets by status:', error);
    } finally {
      setL3TicketsByStatusLoading(false);
    }
  };

  // Fetch incidents by week based on selected month's year
  const fetchIncidentsByWeek = async () => {
    setIncidentsByWeekLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      params.set('year', selectedYear.toString());

      const response = await fetch(
        `http://localhost:3000/monthly-report/incidents-by-week?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setIncidentsByWeek(result);
      }
    } catch (error) {
      console.error('Failed to fetch incidents by week:', error);
    } finally {
      setIncidentsByWeekLoading(false);
    }
  };

  // Fetch incidents by day
  const fetchIncidentsByDay = async () => {
    setIncidentsByDayLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);

      const response = await fetch(
        `http://localhost:3000/monthly-report/incidents-by-day?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setIncidentsByDay(result);
      }
    } catch (error) {
      console.error('Failed to fetch incidents by day:', error);
    } finally {
      setIncidentsByDayLoading(false);
    }
  };

  // Fetch incident overview by category
  const fetchIncidentOverview = async () => {
    setIncidentOverviewLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      // Monthly mode: only send endDate (last day of month)
      // Weekly mode: send both startDate and endDate
      if (isMonthlyMode) {
        params.set('endDate', lastDayOfMonth);
      } else {
        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);
      }

      const response = await fetch(
        `http://localhost:3000/monthly-report/incident-overview-by-category?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setIncidentOverview(result);
      }
    } catch (error) {
      console.error('Failed to fetch incident overview:', error);
    } finally {
      setIncidentOverviewLoading(false);
    }
  };

  // Fetch L3 summary
  const fetchL3Summary = async () => {
    setL3SummaryLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);

      const response = await fetch(
        `http://localhost:3000/monthly-report/l3-summary?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setL3Summary(result);
      }
    } catch (error) {
      console.error('Failed to fetch L3 summary:', error);
    } finally {
      setL3SummaryLoading(false);
    }
  };

  // Fetch L3 requests by status
  const fetchL3RequestsByStatus = async () => {
    setL3RequestsByStatusLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);

      const response = await fetch(
        `http://localhost:3000/monthly-report/l3-requests-by-status?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setL3RequestsByStatus(result);
      }
    } catch (error) {
      console.error('Failed to fetch L3 requests by status:', error);
    } finally {
      setL3RequestsByStatusLoading(false);
    }
  };

  // Fetch missing scope by parent
  const fetchMissingScopeByParent = async () => {
    setMissingScopeByParentLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/missing-scope-by-parent?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setMissingScopeByParent(result);
      }
    } catch (error) {
      console.error('Failed to fetch missing scope by parent:', error);
    } finally {
      setMissingScopeByParentLoading(false);
    }
  };

  // Fetch bugs by parent
  const fetchBugsByParent = async () => {
    setBugsByParentLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/bugs-by-parent?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setBugsByParent(result);
      }
    } catch (error) {
      console.error('Failed to fetch bugs by parent:', error);
    } finally {
      setBugsByParentLoading(false);
    }
  };

  // Fetch sessions orders last 30 days
  const fetchSessionsOrdersLast30Days = async () => {
    setSessionsOrdersLoading(true);
    try {
      const response = await fetch(
        'http://localhost:3000/sessions-orders/last-30-days',
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setSessionsOrdersData(result);
      }
    } catch (error) {
      console.error('Failed to fetch sessions orders last 30 days:', error);
    } finally {
      setSessionsOrdersLoading(false);
    }
  };

  // Fetch incidents vs orders by month
  const fetchIncidentsVsOrdersByMonth = async () => {
    setIncidentsVsOrdersLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/sessions-orders/incidents-vs-orders-by-month?year=${selectedYear}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setIncidentsVsOrdersData(result);
      }
    } catch (error) {
      console.error('Failed to fetch incidents vs orders by month:', error);
    } finally {
      setIncidentsVsOrdersLoading(false);
    }
  };

  // Fetch incidents by release by day
  const fetchIncidentsByReleaseByDay = async () => {
    setIncidentsByReleaseByDayLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/incidents-by-release-by-day?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setIncidentsByReleaseByDayData(result);
      }
    } catch (error) {
      console.error('Failed to fetch incidents by release by day:', error);
    } finally {
      setIncidentsByReleaseByDayLoading(false);
    }
  };

  // Fetch change release by module
  const fetchChangeReleaseByModule = async () => {
    setChangeReleaseByModuleLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      if (selectedMonth) params.set('month', selectedMonth);

      const response = await fetch(
        `http://localhost:3000/monthly-report/change-release-by-module?${params.toString()}`,
        { cache: 'no-store' }
      );
      if (response.ok) {
        const result = await response.json();
        setChangeReleaseByModuleData(result);
      }
    } catch (error) {
      console.error('Failed to fetch change release by module:', error);
    } finally {
      setChangeReleaseByModuleLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchSessionsOrdersLast30Days();
  }, []);

  useEffect(() => {
    fetchData();
    fetchCriticalIncidents();
    fetchStabilityIndicators();
    fetchCategoryDistribution();
    fetchBusinessFlowPriority();
    fetchPriorityByApp();
    fetchMissingScopeByParent();
    fetchBugsByParent();
    fetchIncidentsVsOrdersByMonth();
    fetchIncidentsByReleaseByDay();
    fetchChangeReleaseByModule();
  }, [selectedApp, selectedMonth]);

  useEffect(() => {
    fetchL3TicketsByStatus();
    fetchIncidentsByWeek();
    fetchIncidentsByDay();
    fetchL3Summary();
    fetchL3RequestsByStatus();
  }, [selectedApp, selectedMonth]); // Refetch on app or month change

  useEffect(() => {
    fetchModuleEvolution();
    fetchIncidentOverview();
  }, [selectedApp, startDate, endDate, isMonthlyMode, lastDayOfMonth]);

  // Filter data by search term (client-side filtering on top of backend filtering)
  const filteredData = data.filter(item => {
    const matchesSearch =
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toString().includes(searchTerm);

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedApp, selectedMonth]);

  // Status badge color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('closed')) return 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-500 border-jpc-vibrant-emerald-500/30';
    if (statusLower.includes('l3')) return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-500 border-jpc-vibrant-orange-500/30';
    if (statusLower.includes('l2')) return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-500 border-jpc-vibrant-cyan-500/30';
    if (statusLower.includes('l1')) return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-500 border-jpc-vibrant-purple-500/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            War Rooms analytics and incident tracking
          </p>
        </div>

        {/* Sticky Filter Bar */}
        <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-jpc-vibrant-purple-500/20 bg-card/95 backdrop-blur-sm p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {/* Application Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Application</label>
                <Select
                  value={selectedApp}
                  onValueChange={(value) => updateFilters(value, selectedMonth)}
                >
                  <SelectTrigger className="w-full border-jpc-vibrant-purple-500/20 bg-background">
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    {applications.map((app) => (
                      <SelectItem key={app.code} value={app.code}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Month Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">Month</label>
                <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background hover:bg-background/80"
                    >
                      <svg
                        className="mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year</label>
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(year) => {
                            const newMonth = `${year}-${String(selectedMonthNum).padStart(2, '0')}`;
                            updateFilters(selectedApp, newMonth);
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => {
                              const year = DateTime.now().year - 2 + i;
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Month</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1;
                            const monthStr = String(month).padStart(2, '0');
                            const isSelected = month === selectedMonthNum;
                            return (
                              <Button
                                key={month}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className={isSelected ? "bg-jpc-vibrant-purple-500 hover:bg-jpc-vibrant-purple-600" : ""}
                                onClick={() => {
                                  const newMonth = `${selectedYear}-${monthStr}`;
                                  updateFilters(selectedApp, newMonth);
                                  setMonthPickerOpen(false);
                                }}
                              >
                                {DateTime.fromObject({ month }).toFormat('MMM')}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date Range Filter (for Evolution of Incidents) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80">
                  {isMonthlyMode ? 'End Date' : 'Date Range'}
                </label>
                {isMonthlyMode ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background cursor-default"
                    disabled
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {DateTime.fromISO(lastDayOfMonth).toFormat('MMM d, yyyy')}
                  </Button>
                ) : (
                  <Popover open={dateRangePickerOpen} onOpenChange={setDateRangePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-jpc-vibrant-purple-500/20 bg-background hover:bg-background/80"
                      >
                        <svg
                          className="mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {DateTime.fromISO(startDate).toFormat('MMM d')} - {DateTime.fromISO(endDate).toFormat('MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Start Date</label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              updateFilters(selectedApp, selectedMonth, e.target.value, endDate);
                            }}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">End Date</label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              updateFilters(selectedApp, selectedMonth, startDate, e.target.value);
                            }}
                            className="w-full"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const defaultRange = getDefaultDateRange();
                            updateFilters(selectedApp, selectedMonth, defaultRange.startDate, defaultRange.endDate);
                            setDateRangePickerOpen(false);
                          }}
                        >
                          Reset to Default (Last Fri - Last Thu)
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            {/* Report Mode Toggle */}
            <div className="flex items-center gap-3 lg:ml-auto">
              <span className={`text-sm font-medium ${!isMonthlyMode ? 'text-jpc-vibrant-cyan-400' : 'text-muted-foreground'}`}>
                Weekly
              </span>
              <Switch
                checked={isMonthlyMode}
                onCheckedChange={setIsMonthlyMode}
                className="data-[state=checked]:bg-jpc-vibrant-purple-500"
              />
              <span className={`text-sm font-medium ${isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-muted-foreground'}`}>
                Monthly
              </span>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Input
            type="text"
            placeholder="Search by summary or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <div className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${filteredData.length} records`}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              War Rooms Data
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {paginatedData.length} of {filteredData.length} records
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">war_rooms</code>
            </p>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No war rooms data found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                    <TableHead className="text-xs font-semibold text-foreground/80">#</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">Application</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">Assistants</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80 min-w-[200px]">Date/Time Range</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">Request ID</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80 min-w-[300px]">Summary</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80 min-w-[200px]">Notes</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/80">RCA Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={row.requestId}
                      className="border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5 transition-colors group"
                    >
                      <TableCell className="text-xs text-foreground/80">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80">
                        {row.app ? (
                          <Badge
                            variant="outline"
                            className="bg-jpc-vibrant-purple-500/10 text-jpc-vibrant-purple-500 border-jpc-vibrant-purple-500/30"
                          >
                            {row.app.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{row.application}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80">
                        {row.participants}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80">
                        {formatDateTimeRange(row.date, row.startTime, row.endTime)}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80">
                        {row.durationMinutes} min
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.requestIdLink ? (
                          <a
                            href={row.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-jpc-vibrant-cyan-500 hover:text-jpc-vibrant-cyan-400 underline decoration-jpc-vibrant-cyan-500/30 hover:decoration-jpc-vibrant-cyan-400 transition-colors"
                          >
                            {row.requestId}
                          </a>
                        ) : (
                          <span className="text-foreground/80">{row.requestId}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80 max-w-[300px]">
                        <div className="truncate" title={row.summary}>
                          {row.summary}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getStatusColor(row.status)}`}
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80 max-w-[200px]">
                        <div className="truncate" title={row.notes}>
                          {row.notes}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {row.urlRca && row.urlRca !== 'N/A' && row.urlRca.trim() !== '' ? (
                          <a
                            href={row.urlRca}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-jpc-vibrant-purple-500 hover:text-jpc-vibrant-purple-400 underline decoration-jpc-vibrant-purple-500/30 hover:decoration-jpc-vibrant-purple-400 transition-colors"
                          >
                            {row.rcaStatus}
                          </a>
                        ) : (
                          <span className="text-foreground/80">{row.rcaStatus}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && paginatedData.length > 0 && (
            <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/5 to-jpc-vibrant-purple-500/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Items per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground"
                  >
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  <span className="px-3 text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-xs rounded border border-jpc-vibrant-cyan-500/20 bg-background text-foreground hover:bg-jpc-vibrant-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Critical Incidents Section */}
        <div className="mt-8 rounded-2xl border border-jpc-vibrant-orange-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-orange-500/10 backdrop-blur-sm hover:border-jpc-vibrant-orange-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-orange-500/20 bg-gradient-to-r from-jpc-vibrant-orange-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Critical Incidents
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {criticalIncidents.length} critical priority incidents from monthly reports
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
            </p>
          </div>

          {criticalIncidentsLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : criticalIncidents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No critical incidents found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-jpc-vibrant-orange-500/20 hover:bg-jpc-vibrant-orange-500/5">
                    <TableHead className="font-semibold text-foreground/90">Application</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Created Date</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Module</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Subject</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Priority</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Categorization</TableHead>
                    <TableHead className="font-semibold text-foreground/90">RCA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalIncidents.map((incident) => {
                    const moduleDisplayValue = incident.mappedModuleDisplayValue || incident.modulo;
                    const statusDisplayValue = incident.mappedStatusDisplayValue || incident.requestStatus;
                    const categorizationDisplayValue = incident.mappedCategorizationDisplayValue || incident.categorizacion;
                    const createdDate = incident.createdTime
                      ? DateTime.fromISO(incident.createdTime).toFormat('d-MMM-yyyy')
                      : '';
                    return (
                      <TableRow
                        key={incident.requestId}
                        className="border-b border-jpc-vibrant-orange-500/10 hover:bg-jpc-vibrant-orange-500/5 transition-colors group"
                      >
                        <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                          <div className="max-w-xs truncate" title={incident.aplicativos}>
                            {incident.aplicativos}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {incident.requestIdLink ? (
                            <a
                              href={incident.requestIdLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-jpc-vibrant-orange-400 hover:text-jpc-vibrant-orange-300 hover:underline transition-colors"
                            >
                              {incident.requestId}
                            </a>
                          ) : (
                            <span className="text-jpc-vibrant-orange-400">{incident.requestId}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-foreground/80">
                          {createdDate}
                        </TableCell>
                        <TableCell className="text-xs">
                          <Badge
                            variant="outline"
                            className="bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 font-medium transition-all duration-300"
                          >
                            {statusDisplayValue}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                          <div className="max-w-xs truncate" title={moduleDisplayValue}>
                            {moduleDisplayValue}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                          <div className="max-w-md truncate" title={incident.subject}>
                            {incident.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getPriorityColorClasses(incident.priority)} border font-medium transition-all duration-300`}
                          >
                            {incident.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                          {categorizationDisplayValue}
                        </TableCell>
                        <TableCell className="text-xs">
                          {incident.rca && incident.rca !== 'No asignado' ? (
                            <a
                              href={incident.rca}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 underline"
                            >
                              View RCA
                            </a>
                          ) : (
                            <span className="text-muted-foreground/50">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Operational Stability Indicators Section */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-amber-500/10 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Operational Stability Indicators
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
            </p>
          </div>

          {/* Subsection 1: Number of incidents by level by month */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of incidents by level by month
            </h4>
          </div>

          {stabilityIndicatorsLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !stabilityIndicators || stabilityIndicators.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No stability data found for the selected filters
            </div>
          ) : (
            <>
              {/* Warning banner for unmapped statuses */}
              {stabilityIndicators.hasUnmappedStatuses && (
                <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Some records have unmapped statuses. Click on the unmapped count to view details.</span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                      <TableHead className="font-semibold text-foreground/90">Application</TableHead>
                      <TableHead className="font-semibold text-foreground/90 text-right">L2</TableHead>
                      <TableHead className="font-semibold text-foreground/90 text-right">L3</TableHead>
                      <TableHead className="font-semibold text-foreground/90 text-right">Unmapped</TableHead>
                      <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stabilityIndicators.data.map((row) => (
                      <TableRow
                        key={row.application}
                        className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                      >
                        <TableCell className="font-medium text-amber-400">
                          <div className="max-w-xs truncate" title={row.application}>
                            {row.application}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground/90 text-right">
                          {row.l2Count}
                        </TableCell>
                        <TableCell className="text-sm text-foreground/90 text-right">
                          {row.l3Count}
                        </TableCell>
                        <TableCell className="text-sm text-right">
                          {row.unmappedCount > 0 ? (
                            <button
                              onClick={() => {
                                setUnmappedModalData(row.unmappedRequests);
                                setUnmappedModalApp(row.application);
                                setUnmappedModalOpen(true);
                              }}
                              className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300 transition-colors font-medium"
                            >
                              {row.unmappedCount}
                            </button>
                          ) : (
                            <span className="text-foreground/50">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                          {row.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 2: Distribution of incidents by category */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Distribution of incidents by category in {categoryDistribution?.monthName || 'All Time'}
              <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
                {categoryDistribution ? `(${categoryDistribution.totalIncidents} total)` : ''}
              </span>
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnassignedColumn(!showUnassignedColumn)}
              className="text-xs border-amber-500/30 hover:bg-amber-500/10"
            >
              {showUnassignedColumn ? 'Hide Unassigned' : 'Show Unassigned'}
            </Button>
          </div>

          {categoryDistributionLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !categoryDistribution || categoryDistribution.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No category data found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Category</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">New</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Recurring</TableHead>
                    {showUnassignedColumn && (
                      <TableHead className="font-semibold text-foreground/90 text-right">Unassigned</TableHead>
                    )}
                    <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryDistribution.data.map((row) => (
                    <TableRow
                      key={row.categorySourceValue}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        <div className="max-w-xs truncate" title={row.categorySourceValue}>
                          {row.categoryDisplayValue || row.categorySourceValue}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {showUnassignedColumn ? row.newCount : row.newCount + row.unassignedCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.recurringCount}
                      </TableCell>
                      {showUnassignedColumn && (
                        <TableCell className="text-sm text-right">
                          {row.unassignedCount > 0 ? (
                            <button
                              onClick={() => {
                                setUnassignedRecurrencyModalData(row.unassignedRequests);
                                setUnassignedRecurrencyModalCategory(row.categoryDisplayValue || row.categorySourceValue);
                                setUnassignedRecurrencyModalOpen(true);
                              }}
                              className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300 transition-colors font-medium"
                            >
                              {row.unassignedCount}
                            </button>
                          ) : (
                            <span className="text-foreground/50">0</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.total}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground text-right">
                        {row.percentage.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 3: Number of incidents by business-flow by priority */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of incidents by business-flow by priority in {businessFlowPriority?.monthName || 'All Time'}
            </h4>
          </div>

          {businessFlowPriorityLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !businessFlowPriority || businessFlowPriority.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No business flow data found for the selected filters
            </div>
          ) : (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {businessFlowPriority.data.map((priorityData) => (
                  <div
                    key={priorityData.priority}
                    className="rounded-lg border border-amber-500/20 bg-background/50 overflow-hidden"
                  >
                    <div className={`px-4 py-2 border-b border-amber-500/20 ${getPriorityColorClasses(priorityData.priority)} bg-opacity-10`}>
                      <h5 className="text-sm font-semibold flex items-center justify-between">
                        <span>{priorityData.priority}</span>
                        <span className="text-xs font-normal opacity-70">
                          ({priorityData.totalCount} incidents)
                        </span>
                      </h5>
                    </div>
                    {priorityData.modules.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        No incidents
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-amber-500/10 hover:bg-transparent">
                            <TableHead className="text-xs font-medium text-foreground/70 py-2">Module</TableHead>
                            <TableHead className="text-xs font-medium text-foreground/70 py-2 text-right">Count</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {priorityData.modules.map((moduleData) => (
                            <TableRow
                              key={moduleData.moduleSourceValue}
                              className="border-b border-amber-500/5 hover:bg-amber-500/5"
                            >
                              <TableCell className="text-xs text-foreground/80 py-2">
                                <div className="max-w-[150px] truncate" title={moduleData.moduleSourceValue}>
                                  {moduleData.moduleDisplayValue || moduleData.moduleSourceValue}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-foreground/90 py-2 text-right font-medium">
                                {moduleData.count}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 4: Number of incidents by priority in {month} */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of incidents by priority in {priorityByApp?.monthName || 'All Time'}
              <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
                {priorityByApp ? `(${priorityByApp.totalIncidents} total)` : ''}
              </span>
            </h4>
          </div>

          {priorityByAppLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !priorityByApp || priorityByApp.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No priority data found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Application</TableHead>
                    <TableHead className={`font-semibold text-right ${getPriorityColorClasses(Priority.Critical)}`}>Critical</TableHead>
                    <TableHead className={`font-semibold text-right ${getPriorityColorClasses(Priority.High)}`}>High</TableHead>
                    <TableHead className={`font-semibold text-right ${getPriorityColorClasses(Priority.Medium)}`}>Medium</TableHead>
                    <TableHead className={`font-semibold text-right ${getPriorityColorClasses(Priority.Low)}`}>Low</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorityByApp.data.map((row) => (
                    <TableRow
                      key={row.application}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        <div className="max-w-xs truncate" title={row.application}>
                          {row.application}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.criticalCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.highCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.mediumCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.lowCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 5: Number of L3 tickets by status */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of L3 tickets by status
              <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
                {l3TicketsByStatus ? `(${l3TicketsByStatus.totalL3Tickets} total)` : ''}
              </span>
              <span className="ml-2 text-muted-foreground/50 normal-case font-normal">
                | Source: <code className="px-1 py-0.5 rounded bg-muted/50 text-xs">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50 text-xs">monthly_reports</code>
              </span>
            </h4>
          </div>

          {l3TicketsByStatusLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !l3TicketsByStatus || l3TicketsByStatus.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No L3 tickets found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Application</TableHead>
                    {l3TicketsByStatus.statusColumns.map((status) => (
                      <TableHead key={status} className="font-semibold text-foreground/90 text-right">
                        {status}
                      </TableHead>
                    ))}
                    <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {l3TicketsByStatus.data.map((row) => (
                    <TableRow
                      key={row.application}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        <div className="max-w-xs truncate" title={row.application}>
                          {row.application}
                        </div>
                      </TableCell>
                      {l3TicketsByStatus.statusColumns.map((status) => (
                        <TableCell key={status} className="text-sm text-foreground/90 text-right">
                          {row.statusCounts[status] || ''}
                        </TableCell>
                      ))}
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 6: Number of incidents by week in 2025 */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of incidents by week in {incidentsByWeek?.year || 2025}
              <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
                {incidentsByWeek ? `(${incidentsByWeek.totalIncidents} total)` : ''}
              </span>
            </h4>
          </div>

          {incidentsByWeekLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !incidentsByWeek || incidentsByWeek.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No incidents found for {incidentsByWeek?.year || 2025}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Week</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Date Range</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentsByWeek.data.map((row) => (
                    <TableRow
                      key={row.weekNumber}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        Week {row.weekNumber}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {row.startDate} - {row.endDate}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Sessions/Orders tables - Only show for Somos Belcorp */}
          {selectedApp === 'SB' && (
            <>
              {/* Divider between subsections */}
              <div className="border-t border-amber-500/20 mt-4" />

              {/* Subsection 7: Sessions and Orders - Last 30 Days */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Sessions and Orders - Last 30 Days
              <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
                (sorted ascending by date)
              </span>
            </h4>
          </div>

          {sessionsOrdersLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !sessionsOrdersData || sessionsOrdersData.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No sessions/orders data found for the last 30 days
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Day</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Incidents</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right"># of Sessions</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right"># of Placed Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionsOrdersData.data.map((row) => (
                    <TableRow
                      key={row.date}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        {row.day}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.incidents}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.sessions}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.placedOrders}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 8: Number of Incidents vs Placed Orders by Month */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              Number of Incidents vs Placed Orders by Month
            </h4>
          </div>

          {incidentsVsOrdersLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !incidentsVsOrdersData || incidentsVsOrdersData.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No incidents vs orders data found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Month</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Incidents</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Placed Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentsVsOrdersData.data.map((row) => (
                    <TableRow
                      key={row.monthNumber}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        {row.month}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.incidents}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.placedOrders}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 9: {MONTH} Incident by Release by Day */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              {incidentsByReleaseByDayData?.monthName || 'Month'} Incident by Release by Day
            </h4>
          </div>

          {incidentsByReleaseByDayLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !incidentsByReleaseByDayData || incidentsByReleaseByDayData.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No incidents by release by day data found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Day</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Incidents</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Error por Cambio</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentsByReleaseByDayData.data.map((row) => (
                    <TableRow
                      key={row.day}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        {row.dayLabel}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.incidents}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.errorPorCambioCount}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Divider between subsections */}
          <div className="border-t border-amber-500/20 mt-4" />

          {/* Subsection 10: {MONTH} Change Release by Module */}
          <div className="px-6 pt-4 pb-2">
            <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
              {changeReleaseByModuleData?.monthName || 'Month'} Change Release by Module
            </h4>
          </div>

          {changeReleaseByModuleLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !changeReleaseByModuleData || changeReleaseByModuleData.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No change release by module data found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Module</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changeReleaseByModuleData.data.map((row) => (
                    <TableRow
                      key={row.moduleSourceValue}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        {row.moduleDisplayValue || row.moduleSourceValue}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.incidents}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </>
          )}
        </div>

        {/* Distribution of Missing Scope by Parent Ticket Section */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-amber-500/10 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Distribution of Missing Scope by Parent Ticket
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                {missingScopeByParent ? `(${missingScopeByParent.totalIncidents} total in ${missingScopeByParent.monthName})` : ''}
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>, <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">problems</code>, <code className="px-1 py-0.5 rounded bg-muted/50">parent_child_requests</code>
            </p>
          </div>

          {missingScopeByParentLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !missingScopeByParent || missingScopeByParent.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No missing scope incidents found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20 hover:bg-amber-500/5">
                    <TableHead className="font-semibold text-foreground/90">Created Date</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Linked Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Additional Information</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Total Linked</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">In Month</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Request Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingScopeByParent.data.map((row, index) => (
                    <TableRow
                      key={row.linkedRequestId || `unassigned-${index}`}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="text-sm text-foreground/80">
                        {row.createdDate || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-amber-400">
                        {row.linkedRequestIdLink ? (
                          <a
                            href={row.linkedRequestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-amber-300 hover:underline transition-colors"
                          >
                            {row.linkedRequestId}
                          </a>
                        ) : (
                          <span>{row.linkedRequestId || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80 max-w-xs truncate" title={row.additionalInfo}>
                        {row.additionalInfo || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.totalLinkedTickets || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.linkedTicketsInMonth}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {row.requestStatus || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {row.eta || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* TOTAL Row */}
                  <TableRow className="border-t-2 border-amber-500/30 bg-amber-500/10 font-bold">
                    <TableCell className="text-sm text-foreground font-bold">TOTAL</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-sm text-foreground text-right font-bold">
                      {missingScopeByParent.totalIncidents}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Distribution of Bugs by Parent Ticket Section */}
        <div className="mt-8 rounded-2xl border border-red-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-red-500/10 backdrop-blur-sm hover:border-red-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Distribution of Bugs by Parent Ticket
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                {bugsByParent ? `(${bugsByParent.totalIncidents} total in ${bugsByParent.monthName})` : ''}
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy')} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>, <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">problems</code>, <code className="px-1 py-0.5 rounded bg-muted/50">parent_child_requests</code>
            </p>
          </div>

          {bugsByParentLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !bugsByParent || bugsByParent.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No bug incidents found for the selected filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-red-500/20 hover:bg-red-500/5">
                    <TableHead className="font-semibold text-foreground/90">Created Date</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Linked Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Additional Information</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Total Linked</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">In Month</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Request Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugsByParent.data.map((row, index) => (
                    <TableRow
                      key={row.linkedRequestId || `unassigned-${index}`}
                      className="border-b border-red-500/10 hover:bg-red-500/5 transition-colors"
                    >
                      <TableCell className="text-sm text-foreground/80">
                        {row.createdDate || '-'}
                      </TableCell>
                      <TableCell className="font-medium text-red-400">
                        {row.linkedRequestIdLink ? (
                          <a
                            href={row.linkedRequestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-red-300 hover:underline transition-colors"
                          >
                            {row.linkedRequestId}
                          </a>
                        ) : (
                          <span>{row.linkedRequestId || '-'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80 max-w-xs truncate" title={row.additionalInfo}>
                        {row.additionalInfo || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right">
                        {row.totalLinkedTickets || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                        {row.linkedTicketsInMonth}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {row.requestStatus || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        {row.eta || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* TOTAL Row */}
                  <TableRow className="border-t-2 border-red-500/30 bg-red-500/10 font-bold">
                    <TableCell className="text-sm text-foreground font-bold">TOTAL</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-sm text-foreground text-right font-bold">
                      {bugsByParent.totalIncidents}
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Incidents by Day Section */}
        <div className="mt-8 rounded-2xl border border-jpc-vibrant-emerald-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-emerald-500/10 backdrop-blur-sm hover:border-jpc-vibrant-emerald-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-emerald-500/20 bg-gradient-to-r from-jpc-vibrant-emerald-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Incidents by Day
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                {incidentsByDay ? `${incidentsByDay.totalIncidents} incidents` : 'Loading...'}
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp}
              <span className="mx-2">|</span>
              Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
            </p>
          </div>
          {incidentsByDayLoading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jpc-vibrant-emerald-500"></div>
            </div>
          ) : incidentsByDay && incidentsByDay.data.length > 0 ? (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-jpc-vibrant-emerald-500/20 hover:bg-transparent">
                    <TableHead className="text-xs font-bold text-foreground/80 uppercase tracking-wider">day</TableHead>
                    <TableHead className="text-xs font-bold text-foreground/80 uppercase tracking-wider text-right">Incidents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidentsByDay.data.map((row) => (
                    <TableRow key={row.day} className="border-b border-jpc-vibrant-emerald-500/10 hover:bg-jpc-vibrant-emerald-500/5 transition-colors">
                      <TableCell className="text-sm text-foreground/80">Day {row.day}</TableCell>
                      <TableCell className="text-sm text-foreground/80 text-right">{row.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Evolution of Incidents Section */}
        <div className="mt-8 rounded-2xl border border-jpc-vibrant-emerald-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-emerald-500/10 backdrop-blur-sm hover:border-jpc-vibrant-emerald-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-emerald-500/20 bg-gradient-to-r from-jpc-vibrant-emerald-500/10 to-jpc-vibrant-purple-500/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Evolution of Incidents
                <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                  {moduleEvolutionData ? `${moduleEvolutionData.total} incidents across ${moduleEvolutionData.data.length} modules` : 'Loading...'}
                </span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {isMonthlyMode ? lastDayOfMonth : `${startDate} to ${endDate}`} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                <span className="mx-2">|</span>
                Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>, <code className="px-1 py-0.5 rounded bg-muted/50">module_registry</code>, <code className="px-1 py-0.5 rounded bg-muted/50">categorization_registry</code>, <code className="px-1 py-0.5 rounded bg-muted/50">parent_child_requests</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_report_status_registry</code>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTicketDetails(!showTicketDetails)}
              className="text-xs border-jpc-vibrant-emerald-500/30 hover:bg-jpc-vibrant-emerald-500/10"
            >
              {showTicketDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {moduleEvolutionLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !moduleEvolutionData || moduleEvolutionData.data.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No incidents found for the selected date range
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-jpc-vibrant-emerald-500/20 hover:bg-jpc-vibrant-emerald-500/5">
                    <TableHead className="font-semibold text-foreground/90">Module / Categorization</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Count</TableHead>
                    <TableHead className="font-semibold text-foreground/90 text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {moduleEvolutionData.data.map((moduleItem) => (
                    <React.Fragment key={moduleItem.moduleSourceValue}>
                      {/* Module Row (Parent) */}
                      <TableRow
                        className="border-b border-jpc-vibrant-emerald-500/10 hover:bg-jpc-vibrant-emerald-500/5 transition-colors"
                      >
                        <TableCell className="font-medium text-jpc-vibrant-emerald-400 font-bold">
                          <span title={moduleItem.moduleSourceValue}>
                            {moduleItem.moduleDisplayValue || moduleItem.moduleSourceValue}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                          {moduleItem.count}
                        </TableCell>
                        <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                          {moduleItem.percentage.toFixed(1)}%
                        </TableCell>
                      </TableRow>

                      {/* Categorization Rows (Children) - always visible */}
                      {moduleItem.categorizations.map((cat) => (
                        <React.Fragment key={`${moduleItem.moduleSourceValue}-${cat.categorizationSourceValue}`}>
                          <TableRow
                            className="border-b border-jpc-vibrant-emerald-500/5 bg-jpc-vibrant-emerald-500/5 hover:bg-jpc-vibrant-emerald-500/10 transition-colors"
                          >
                            <TableCell className="text-xs text-foreground/70 pl-6">
                              <span title={cat.categorizationSourceValue}>
                                {cat.categorizationDisplayValue || cat.categorizationSourceValue}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">
                              {cat.count}
                            </TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">
                              {cat.percentage.toFixed(1)}%
                            </TableCell>
                          </TableRow>

                          {/* Ticket Group Rows - shown below each categorization */}
                          {showTicketDetails && cat.tickets && groupTickets(cat.tickets).map((group) => {
                            const hasParent = group.parentTicketId && group.parentTicketId !== 'No asignado' && group.parentTicketId !== '0';
                            const groupTitle = hasParent
                              ? `${group.additionalInfo && group.additionalInfo !== 'No asignado' ? `${group.additionalInfo} - ` : ''}${group.parentTicketId}`
                              : group.displayStatus;

                            return (
                              <TableRow
                                key={`${moduleItem.moduleSourceValue}-${cat.categorizationSourceValue}-${group.key}`}
                                className="border-b border-jpc-vibrant-emerald-500/5 bg-jpc-vibrant-emerald-500/[0.02] hover:bg-jpc-vibrant-emerald-500/5 transition-colors"
                              >
                                <TableCell className="text-xs text-foreground/50 pl-10">
                                  <span
                                    className="text-jpc-vibrant-cyan-400 cursor-pointer hover:text-jpc-vibrant-cyan-300 hover:underline font-medium"
                                    onClick={() => {
                                      setModalRequestIds(group.requestIds);
                                      setModalGroupTitle(groupTitle);
                                      setIsModalOpen(true);
                                    }}
                                  >
                                    {group.count}
                                  </span>
                                  {' '}
                                  {hasParent
                                    ? `${group.additionalInfo && group.additionalInfo !== 'No asignado' ? `${group.additionalInfo} - ` : ''}${group.parentTicketId} --> ${group.linkedTicketsCount} Linked tickets`
                                    : `${group.isUnmapped ? `⚠️ ${group.displayStatus} (Unmapped)` : group.displayStatus}`
                                  }
                                </TableCell>
                                <TableCell className="text-xs text-foreground/50 text-right"></TableCell>
                                <TableCell className="text-xs text-foreground/50 text-right"></TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Incident Overview by Category Section */}
        <div className="mt-8">
          <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Incident Overview by Category
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {isMonthlyMode ? lastDayOfMonth : `${startDate} to ${endDate}`} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                <span className="mx-2">|</span>
                Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
              </p>
            </div>
            {incidentOverview && (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-jpc-vibrant-cyan-400">{incidentOverview.recurrentInL2L3.total}</span> requests of the week
              </span>
            )}
          </div>

          {incidentOverviewLoading ? (
            <div className="p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          ) : !incidentOverview ? (
            <div className="p-8 text-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Row 1: 3 cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Resolved in L2 */}
                <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
                    <h4 className="text-sm font-bold text-foreground">Resolved in L2</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution by category</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Incidents resolved by Level 2 support team during the current week, grouped by incident category</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableHead className="font-semibold text-foreground/90 text-xs">Category</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Count</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidentOverview.resolvedInL2.data.map((item) => (
                          <TableRow key={item.category} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                            <TableCell className="text-xs text-foreground/80">
                              <span title={item.category}>
                                {item.categoryDisplayValue || item.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                          <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
                          <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{incidentOverview.resolvedInL2.total}</TableCell>
                          <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
                    <p className="text-xs text-jpc-vibrant-cyan-400 italic">{incidentOverview.resolvedInL2.total} Resolved tickets of the Week</p>
                  </div>
                </div>

                {/* Card 2: Pending */}
                <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
                    <h4 className="text-sm font-bold text-foreground">Pending</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution by category</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Incidents currently being handled by Level 2 support team, pending resolution</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableHead className="font-semibold text-foreground/90 text-xs">Category</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Count</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidentOverview.pending.data.map((item) => (
                          <TableRow key={item.category} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                            <TableCell className="text-xs text-foreground/80">
                              <span title={item.category}>
                                {item.categoryDisplayValue || item.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                          <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
                          <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{incidentOverview.pending.total}</TableCell>
                          <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
                    <p className="text-xs text-jpc-vibrant-cyan-400 italic">{incidentOverview.pending.total} pending tickets of the Week</p>
                  </div>
                </div>

                {/* Card 3: Recurrent in L2 & L3 */}
                <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
                    <h4 className="text-sm font-bold text-foreground">Recurrent in L2 & L3</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution by recurrency</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Analysis of incident recurrence patterns to identify unique vs recurring issues</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableHead className="font-semibold text-foreground/90 text-xs">Category</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Count</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidentOverview.recurrentInL2L3.data.map((item) => (
                          <TableRow key={item.category} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                            <TableCell className="text-xs text-foreground/80">{item.category}</TableCell>
                            <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                          <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
                          <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{incidentOverview.recurrentInL2L3.total}</TableCell>
                          <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
                    <p className="text-xs text-jpc-vibrant-cyan-400 italic">{incidentOverview.recurrentInL2L3.total} tickets of the Week</p>
                  </div>
                </div>
              </div>

              {/* Row 2: 2 cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 4: Assigned to L3 Backlog */}
                <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
                    <h4 className="text-sm font-bold text-foreground">Assigned to L3 Backlog</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution by Categorie</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Incidents escalated to Level 3 support or currently in the backlog awaiting assignment</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableHead className="font-semibold text-foreground/90 text-xs">Category</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Count</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidentOverview.assignedToL3Backlog.data.map((item) => (
                          <TableRow key={item.category} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                            <TableCell className="text-xs text-foreground/80">
                              <span title={item.category}>
                                {item.categoryDisplayValue || item.category}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                          <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
                          <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{incidentOverview.assignedToL3Backlog.total}</TableCell>
                          <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
                    <p className="text-xs text-jpc-vibrant-cyan-400 italic">{incidentOverview.assignedToL3Backlog.total} pending tickets of the Week</p>
                  </div>
                </div>

                {/* Card 5: L3 Status */}
                <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                  <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
                    <h4 className="text-sm font-bold text-foreground">L3 Status</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Distribution by Status</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Level 3 incident status distribution from previous periods, showing backlog evolution over time</p>
                    <p className="text-xs text-muted-foreground/50 mt-1">
                      {isMonthlyMode
                        ? <>Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | {lastDayOfMonth} | Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code></>
                        : <>Filter: Records before {startDate} | Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code></>
                      }
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-jpc-vibrant-cyan-500/20 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableHead className="font-semibold text-foreground/90 text-xs">Category</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Count</TableHead>
                          <TableHead className="font-semibold text-foreground/90 text-xs text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidentOverview.l3Status.data.map((item) => (
                          <TableRow key={item.status} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                            <TableCell className="text-xs text-foreground/80">{item.status}</TableCell>
                            <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                            <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                          <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
                          <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{incidentOverview.l3Status.total}</TableCell>
                          <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
                    <p className="text-xs text-jpc-vibrant-cyan-400 italic">{incidentOverview.l3Status.total} tickets previous week</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* L3 Summary Section */}
        <div className="mt-8">
          <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                L3 Summary
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                <span className="mx-2">|</span>
                Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
              </p>
            </div>
            {l3Summary && (
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-jpc-vibrant-cyan-400">{l3Summary.totals.total}</span> pending code fixes
              </span>
            )}
          </div>

          {l3SummaryLoading ? (
            <div className="p-8">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : !l3Summary ? (
            <div className="p-8 text-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="p-6">
              <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                        <TableHead className="font-bold text-foreground text-sm">Pending code fixes</TableHead>
                        <TableHead className="font-bold text-foreground text-sm text-center">Critical</TableHead>
                        <TableHead className="font-bold text-foreground text-sm text-center">High</TableHead>
                        <TableHead className="font-bold text-foreground text-sm text-center">Medium</TableHead>
                        <TableHead className="font-bold text-foreground text-sm text-center">Low</TableHead>
                        <TableHead className="font-bold text-foreground text-sm text-center">TOTAL</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {l3Summary.data.map((row) => (
                        <TableRow key={row.status} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableCell className="text-sm text-foreground/80">{row.statusLabel}</TableCell>
                          <TableCell className="text-sm text-center">
                            {row.critical > 0 ? (
                              <span className="text-red-400 font-semibold">{row.critical}</span>
                            ) : (
                              <span className="text-foreground/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {row.high > 0 ? (
                              <span className="text-orange-400 font-semibold">{row.high}</span>
                            ) : (
                              <span className="text-foreground/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {row.medium > 0 ? (
                              <span className="text-yellow-400 font-semibold">{row.medium}</span>
                            ) : (
                              <span className="text-foreground/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-center">
                            {row.low > 0 ? (
                              <span className="text-green-400 font-semibold">{row.low}</span>
                            ) : (
                              <span className="text-foreground/50">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-center font-semibold text-jpc-vibrant-cyan-400">{row.total}</TableCell>
                        </TableRow>
                      ))}
                      {/* TOTAL Row */}
                      <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
                        <TableCell className="text-sm font-bold text-foreground">TOTAL</TableCell>
                        <TableCell className="text-sm text-center font-bold">
                          {l3Summary.totals.critical > 0 ? (
                            <span className="text-red-400">{l3Summary.totals.critical}</span>
                          ) : (
                            <span className="text-foreground/50">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center font-bold">
                          {l3Summary.totals.high > 0 ? (
                            <span className="text-orange-400">{l3Summary.totals.high}</span>
                          ) : (
                            <span className="text-foreground/50">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center font-bold">
                          {l3Summary.totals.medium > 0 ? (
                            <span className="text-yellow-400">{l3Summary.totals.medium}</span>
                          ) : (
                            <span className="text-foreground/50">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center font-bold">
                          {l3Summary.totals.low > 0 ? (
                            <span className="text-green-400">{l3Summary.totals.low}</span>
                          ) : (
                            <span className="text-foreground/50">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-center font-bold text-jpc-vibrant-cyan-400">{l3Summary.totals.total}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* L3 Requests by Status Sections */}
        {l3RequestsByStatusLoading ? (
          <div className="mt-8 p-8">
            <Skeleton className="h-64 w-full" />
          </div>
        ) : l3RequestsByStatus && (
          <div className="mt-8 space-y-6">
            {/* Ready to Deploy Section */}
            <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between bg-jpc-vibrant-cyan-500/5">
                <div>
                  <h4 className="text-md font-semibold text-foreground">
                    Ready to deploy
                  </h4>
                  <p className="text-xs text-muted-foreground/50">
                    Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                    <span className="mx-2">|</span>
                    Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code> + <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code> (Nivel 3)
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-jpc-vibrant-cyan-400">{l3RequestsByStatus.prdDeployment.length}</span> request(s)
                </span>
              </div>
              {l3RequestsByStatus.prdDeployment.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-jpc-vibrant-cyan-500/30">
                        <TableHead className="font-semibold text-foreground/80 text-sm w-12">#</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Request ID</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Create Date</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Module</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Subject</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm text-center">Linked Tickets</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">ETA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {l3RequestsByStatus.prdDeployment.map((req, index) => (
                        <TableRow key={req.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableCell className="text-sm text-foreground/60">{index + 1}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {req.requestIdLink ? (
                              <a href={req.requestIdLink} target="_blank" rel="noopener noreferrer"
                                 className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors">
                                {req.requestId}
                              </a>
                            ) : (
                              <span className="text-jpc-vibrant-cyan-400">{req.requestId}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.createdTime}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.modulo}</TableCell>
                          <TableCell className="text-sm text-foreground/80 max-w-xs truncate">{req.subject}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`font-medium ${
                              req.priorityEnglish === 'Critical' ? 'text-red-400' :
                              req.priorityEnglish === 'High' ? 'text-orange-400' :
                              req.priorityEnglish === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {req.priorityEnglish}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-center text-foreground/80">{req.linkedTicketsCount}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.eta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* In Testing Section */}
            <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between bg-jpc-vibrant-cyan-500/5">
                <div>
                  <h4 className="text-md font-semibold text-foreground">
                    In testing
                  </h4>
                  <p className="text-xs text-muted-foreground/50">
                    Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                    <span className="mx-2">|</span>
                    Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code> + <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code> (Nivel 3)
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-jpc-vibrant-cyan-400">{l3RequestsByStatus.inTesting.length}</span> request(s)
                </span>
              </div>
              {l3RequestsByStatus.inTesting.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-jpc-vibrant-cyan-500/30">
                        <TableHead className="font-semibold text-foreground/80 text-sm w-12">#</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Request ID</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Create Date</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Module</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Subject</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm text-center">Linked Tickets</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">ETA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {l3RequestsByStatus.inTesting.map((req, index) => (
                        <TableRow key={req.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableCell className="text-sm text-foreground/60">{index + 1}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {req.requestIdLink ? (
                              <a href={req.requestIdLink} target="_blank" rel="noopener noreferrer"
                                 className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors">
                                {req.requestId}
                              </a>
                            ) : (
                              <span className="text-jpc-vibrant-cyan-400">{req.requestId}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.createdTime}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.modulo}</TableCell>
                          <TableCell className="text-sm text-foreground/80 max-w-xs truncate">{req.subject}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`font-medium ${
                              req.priorityEnglish === 'Critical' ? 'text-red-400' :
                              req.priorityEnglish === 'High' ? 'text-orange-400' :
                              req.priorityEnglish === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {req.priorityEnglish}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-center text-foreground/80">{req.linkedTicketsCount}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.eta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Dev in Progress Section */}
            <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between bg-jpc-vibrant-cyan-500/5">
                <div>
                  <h4 className="text-md font-semibold text-foreground">
                    Dev in progress
                  </h4>
                  <p className="text-xs text-muted-foreground/50">
                    Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                    <span className="mx-2">|</span>
                    Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code> + <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code> (Nivel 3)
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-jpc-vibrant-cyan-400">{l3RequestsByStatus.devInProgress.length}</span> request(s)
                </span>
              </div>
              {l3RequestsByStatus.devInProgress.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-jpc-vibrant-cyan-500/30">
                        <TableHead className="font-semibold text-foreground/80 text-sm w-12">#</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Request ID</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Create Date</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Module</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Subject</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm text-center">Linked Tickets</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">ETA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {l3RequestsByStatus.devInProgress.map((req, index) => (
                        <TableRow key={req.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableCell className="text-sm text-foreground/60">{index + 1}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {req.requestIdLink ? (
                              <a href={req.requestIdLink} target="_blank" rel="noopener noreferrer"
                                 className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors">
                                {req.requestId}
                              </a>
                            ) : (
                              <span className="text-jpc-vibrant-cyan-400">{req.requestId}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.createdTime}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.modulo}</TableCell>
                          <TableCell className="text-sm text-foreground/80 max-w-xs truncate">{req.subject}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`font-medium ${
                              req.priorityEnglish === 'Critical' ? 'text-red-400' :
                              req.priorityEnglish === 'High' ? 'text-orange-400' :
                              req.priorityEnglish === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {req.priorityEnglish}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-center text-foreground/80">{req.linkedTicketsCount}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.eta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* In Backlog Section */}
            <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
              <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between bg-jpc-vibrant-cyan-500/5">
                <div>
                  <h4 className="text-md font-semibold text-foreground">
                    In backlog
                  </h4>
                  <p className="text-xs text-muted-foreground/50">
                    Filters: {selectedApp === 'all' ? 'All Applications' : applications.find(a => a.code === selectedApp)?.name || selectedApp} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                    <span className="mx-2">|</span>
                    Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code> + <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code> (Nivel 3)
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  <span className="font-semibold text-jpc-vibrant-cyan-400">{l3RequestsByStatus.inBacklog.length}</span> request(s)
                </span>
              </div>
              {l3RequestsByStatus.inBacklog.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-jpc-vibrant-cyan-500/30">
                        <TableHead className="font-semibold text-foreground/80 text-sm w-12">#</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Request ID</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Create Date</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Module</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Subject</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">Priority</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm text-center">Linked Tickets</TableHead>
                        <TableHead className="font-semibold text-foreground/80 text-sm">ETA</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {l3RequestsByStatus.inBacklog.map((req, index) => (
                        <TableRow key={req.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                          <TableCell className="text-sm text-foreground/60">{index + 1}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {req.requestIdLink ? (
                              <a href={req.requestIdLink} target="_blank" rel="noopener noreferrer"
                                 className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors">
                                {req.requestId}
                              </a>
                            ) : (
                              <span className="text-jpc-vibrant-cyan-400">{req.requestId}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.createdTime}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.modulo}</TableCell>
                          <TableCell className="text-sm text-foreground/80 max-w-xs truncate">{req.subject}</TableCell>
                          <TableCell className="text-sm">
                            <span className={`font-medium ${
                              req.priorityEnglish === 'Critical' ? 'text-red-400' :
                              req.priorityEnglish === 'High' ? 'text-orange-400' :
                              req.priorityEnglish === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {req.priorityEnglish}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-center text-foreground/80">{req.linkedTicketsCount}</TableCell>
                          <TableCell className="text-sm text-foreground/80">{req.eta}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal for Request IDs */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Request IDs - {modalGroupTitle}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              <div className="flex flex-wrap gap-2">
                {modalRequestIds.map((item) => (
                  <span
                    key={item.requestId}
                    className="px-2 py-1 rounded-md bg-muted/50 text-sm font-mono"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jpc-vibrant-cyan-500 hover:text-jpc-vibrant-cyan-400 underline decoration-jpc-vibrant-cyan-500/30 hover:decoration-jpc-vibrant-cyan-400 transition-colors"
                      >
                        {item.requestId}
                      </a>
                    ) : (
                      <span>{item.requestId}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Total: {modalRequestIds.length} request(s)
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal for Unmapped Requests */}
        <Dialog open={unmappedModalOpen} onOpenChange={setUnmappedModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-amber-400">
                Unmapped Requests - {unmappedModalApp}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20">
                    <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Raw Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmappedModalData.map((item) => (
                    <TableRow key={item.requestId} className="border-b border-amber-500/10 hover:bg-amber-500/5">
                      <TableCell className="font-mono text-sm">
                        {item.requestIdLink ? (
                          <a
                            href={item.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
                          >
                            {item.requestId}
                          </a>
                        ) : (
                          <span className="text-foreground/80">{item.requestId}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {item.rawStatus}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Total: {unmappedModalData.length} unmapped request(s)
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal for Unassigned Recurrency Requests */}
        <Dialog open={unassignedRecurrencyModalOpen} onOpenChange={setUnassignedRecurrencyModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-amber-400">
                Unassigned Recurrency - {unassignedRecurrencyModalCategory}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-amber-500/20">
                    <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Raw Recurrency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unassignedRecurrencyModalData.map((item) => (
                    <TableRow key={item.requestId} className="border-b border-amber-500/10 hover:bg-amber-500/5">
                      <TableCell className="font-mono text-sm">
                        {item.requestIdLink ? (
                          <a
                            href={item.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
                          >
                            {item.requestId}
                          </a>
                        ) : (
                          <span className="text-foreground/80">{item.requestId}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-foreground/70">
                        {item.rawRecurrency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Total: {unassignedRecurrencyModalData.length} unassigned request(s)
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

export default function AnalyticsDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <AnalyticsDashboardContent />
    </Suspense>
  );
}
