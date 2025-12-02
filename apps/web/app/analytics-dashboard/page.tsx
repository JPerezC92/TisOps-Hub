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
import { Priority } from '@repo/reports/frontend';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';

interface MonthlyReport {
  requestId: number;
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
  categorization: string;
  count: number;
  percentage: number;
  tickets: TicketDetail[];
}

interface ModuleEvolution {
  module: string;
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
  category: string;
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
  module: string;
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

// Group tickets by parentTicketId (if exists) or displayStatus
function groupTickets(tickets: TicketDetail[]): TicketGroup[] {
  const groups = new Map<string, TicketGroup>();

  for (const ticket of tickets) {
    const hasParent = ticket.parentTicketId && ticket.parentTicketId !== 'No asignado';
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

  // Update URL parameters
  const updateFilters = useCallback(
    (app: string, month: string, newStartDate?: string, newEndDate?: string) => {
      const params = new URLSearchParams();
      if (app !== 'all') params.set('app', app);
      if (month) params.set('month', month);
      if (newStartDate) params.set('startDate', newStartDate);
      if (newEndDate) params.set('endDate', newEndDate);

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [router, pathname]
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
      params.set('startDate', startDate);
      params.set('endDate', endDate);

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

  // Fetch incidents by week in 2025
  const fetchIncidentsByWeek = async () => {
    setIncidentsByWeekLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedApp !== 'all') params.set('app', selectedApp);
      params.set('year', '2025'); // Fixed to 2025 as per spec

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

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchData();
    fetchCriticalIncidents();
    fetchStabilityIndicators();
    fetchCategoryDistribution();
    fetchBusinessFlowPriority();
    fetchPriorityByApp();
  }, [selectedApp, selectedMonth]);

  useEffect(() => {
    fetchL3TicketsByStatus();
    fetchIncidentsByWeek();
  }, [selectedApp]); // Only refetch on app change, not month

  useEffect(() => {
    fetchModuleEvolution();
  }, [selectedApp, startDate, endDate]);

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
                <label className="text-sm font-medium text-foreground/80">Date Range</label>
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
              </div>
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
                    <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Application</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Status</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Module</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Subject</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Priority</TableHead>
                    <TableHead className="font-semibold text-foreground/90">Categorization</TableHead>
                    <TableHead className="font-semibold text-foreground/90">RCA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {criticalIncidents.map((incident) => (
                    <TableRow
                      key={incident.requestId}
                      className="border-b border-jpc-vibrant-orange-500/10 hover:bg-jpc-vibrant-orange-500/5 transition-colors group"
                    >
                      <TableCell className="font-medium text-jpc-vibrant-orange-400">
                        {incident.requestId}
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                        <div className="max-w-xs truncate" title={incident.aplicativos}>
                          {incident.aplicativos}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className="bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 font-medium transition-all duration-300"
                        >
                          {incident.requestStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                        <div className="max-w-xs truncate" title={incident.modulo}>
                          {incident.modulo}
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
                        {incident.categorizacion}
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
                  ))}
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
                      key={row.category}
                      className="border-b border-amber-500/10 hover:bg-amber-500/5 transition-colors"
                    >
                      <TableCell className="font-medium text-amber-400">
                        <div className="max-w-xs truncate" title={row.category}>
                          {row.category}
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
                                setUnassignedRecurrencyModalCategory(row.category);
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
                              key={moduleData.module}
                              className="border-b border-amber-500/5 hover:bg-amber-500/5"
                            >
                              <TableCell className="text-xs text-foreground/80 py-2">
                                <div className="max-w-[150px] truncate" title={moduleData.module}>
                                  {moduleData.module}
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
        </div>

        {/* Evolution of Incidents Section */}
        <div className="mt-8 rounded-2xl border border-jpc-vibrant-emerald-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-emerald-500/10 backdrop-blur-sm hover:border-jpc-vibrant-emerald-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-emerald-500/20 bg-gradient-to-r from-jpc-vibrant-emerald-500/10 to-jpc-vibrant-purple-500/5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              Evolution of Incidents
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                {moduleEvolutionData ? `${moduleEvolutionData.total} incidents across ${moduleEvolutionData.data.length} modules` : 'Loading...'}
              </span>
            </h3>
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
                    <React.Fragment key={moduleItem.module}>
                      {/* Module Row (Parent) */}
                      <TableRow
                        className="border-b border-jpc-vibrant-emerald-500/10 hover:bg-jpc-vibrant-emerald-500/5 transition-colors"
                      >
                        <TableCell className="font-medium text-jpc-vibrant-emerald-400 font-bold">
                          {moduleItem.module}
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
                        <React.Fragment key={`${moduleItem.module}-${cat.categorization}`}>
                          <TableRow
                            className="border-b border-jpc-vibrant-emerald-500/5 bg-jpc-vibrant-emerald-500/5 hover:bg-jpc-vibrant-emerald-500/10 transition-colors"
                          >
                            <TableCell className="text-xs text-foreground/70 pl-6">
                              {cat.categorization}
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
                            const hasParent = group.parentTicketId && group.parentTicketId !== 'No asignado';
                            const groupTitle = hasParent
                              ? `${group.additionalInfo && group.additionalInfo !== 'No asignado' ? `${group.additionalInfo} - ` : ''}${group.parentTicketId}`
                              : group.displayStatus;

                            return (
                              <TableRow
                                key={`${moduleItem.module}-${cat.categorization}-${group.key}`}
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
