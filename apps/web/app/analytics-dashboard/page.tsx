'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
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
import { Button } from '@/components/ui/button';
import { Priority } from '@repo/reports/common';
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

  // Get filter values from URL parameters
  const selectedApp = searchParams.get('app') || 'all';
  const selectedMonth = searchParams.get('month') || DateTime.now().toFormat('yyyy-MM');

  // Parse selected month for picker
  const parts = selectedMonth.split('-').map(Number);
  const selectedYear = parts[0] ?? DateTime.now().year;
  const selectedMonthNum = parts[1] ?? DateTime.now().month;

  // Update URL parameters
  const updateFilters = useCallback((app: string, month: string) => {
    const params = new URLSearchParams();
    if (app !== 'all') params.set('app', app);
    if (month) params.set('month', month);

    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  }, [router, pathname]);

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

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchData();
    fetchCriticalIncidents();
  }, [selectedApp, selectedMonth]);

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
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
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
