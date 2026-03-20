'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Priority } from '@repo/reports/frontend';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import { UnmappedRequestsModal } from '@/modules/analytics-dashboard/components/unmapped-requests-modal';
import { UnassignedRecurrencyModal } from '@/modules/analytics-dashboard/components/unassigned-recurrency-modal';
import type {
  Application,
  UnmappedRequest,
  UnassignedRecurrencyRequest,
  StabilityIndicatorsResponse,
  CategoryDistributionResponse,
  BusinessFlowPriorityResponse,
  PriorityByAppResponse,
  L3TicketsByStatusResponse,
  IncidentsByWeekResponse,
  SessionsOrdersLast30DaysResponse,
  IncidentsVsOrdersByMonthResponse,
  IncidentsByReleaseByDayResponse,
  ChangeReleaseByModuleResponse,
} from '@/modules/analytics-dashboard/types';

interface StabilityIndicatorsSectionProps {
  selectedApp: string;
  selectedMonth: string;
  selectedYear: number;
  isMonthlyMode: boolean;
  applications: Application[];
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function StabilityIndicatorsSection({
  selectedApp,
  selectedMonth,
  selectedYear,
  isMonthlyMode,
  applications,
}: StabilityIndicatorsSectionProps) {
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

  // Fetch sessions/orders once on mount
  useEffect(() => {
    const fetchInitial = async () => {
      setSessionsOrdersLoading(true);
      const result = await analyticsDashboardService.getSessionsOrdersLast30Days();
      setSessionsOrdersData(result);
      setSessionsOrdersLoading(false);
    };
    fetchInitial();
  }, []);

  // Fetch app+month dependent data
  useEffect(() => {
    const fetchAppMonth = async () => {
      setStabilityIndicatorsLoading(true);
      setCategoryDistributionLoading(true);
      setBusinessFlowPriorityLoading(true);
      setPriorityByAppLoading(true);
      setIncidentsVsOrdersLoading(true);
      setIncidentsByReleaseByDayLoading(true);
      setChangeReleaseByModuleLoading(true);

      const [stability, catDist, bizFlow, prioApp, incVsOrders, incRelease, changeRelease] = await Promise.all([
        analyticsDashboardService.getStabilityIndicators(selectedApp, selectedMonth),
        analyticsDashboardService.getCategoryDistribution(selectedApp, selectedMonth),
        analyticsDashboardService.getBusinessFlowPriority(selectedApp, selectedMonth),
        analyticsDashboardService.getPriorityByApp(selectedApp, selectedMonth),
        analyticsDashboardService.getIncidentsVsOrdersByMonth(selectedYear),
        analyticsDashboardService.getIncidentsByReleaseByDay(selectedApp, selectedMonth),
        analyticsDashboardService.getChangeReleaseByModule(selectedApp, selectedMonth),
      ]);

      setStabilityIndicators(stability);
      setStabilityIndicatorsLoading(false);
      setCategoryDistribution(catDist);
      setCategoryDistributionLoading(false);
      setBusinessFlowPriority(bizFlow);
      setBusinessFlowPriorityLoading(false);
      setPriorityByApp(prioApp);
      setPriorityByAppLoading(false);
      setIncidentsVsOrdersData(incVsOrders);
      setIncidentsVsOrdersLoading(false);
      setIncidentsByReleaseByDayData(incRelease);
      setIncidentsByReleaseByDayLoading(false);
      setChangeReleaseByModuleData(changeRelease);
      setChangeReleaseByModuleLoading(false);
    };
    fetchAppMonth();
  }, [selectedApp, selectedMonth, selectedYear]);

  // Fetch app-only dependent data
  useEffect(() => {
    const fetchAppOnly = async () => {
      setL3TicketsByStatusLoading(true);
      setIncidentsByWeekLoading(true);

      const [l3Tickets, incWeek] = await Promise.all([
        analyticsDashboardService.getL3TicketsByStatus(selectedApp),
        analyticsDashboardService.getIncidentsByWeek(selectedApp, selectedYear),
      ]);

      setL3TicketsByStatus(l3Tickets);
      setL3TicketsByStatusLoading(false);
      setIncidentsByWeek(incWeek);
      setIncidentsByWeekLoading(false);
    };
    fetchAppOnly();
  }, [selectedApp, selectedYear]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  return (
    <>
      <div className="mt-8 rounded-2xl border border-amber-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-amber-500/10 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Operational Stability Indicators
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Filters: {appLabel} |{' '}
            <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>
              {isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}
            </span>
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
          <LoadingSkeleton />
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
          <LoadingSkeleton />
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
          <LoadingSkeleton />
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

        {/* Subsection 4: Number of incidents by priority */}
        <div className="px-6 pt-4 pb-2">
          <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
            Number of incidents by priority in {priorityByApp?.monthName || 'All Time'}
            <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
              {priorityByApp ? `(${priorityByApp.totalIncidents} total)` : ''}
            </span>
          </h4>
        </div>

        {priorityByAppLoading ? (
          <LoadingSkeleton />
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
          <LoadingSkeleton />
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

        {/* Subsection 6: Number of incidents by week */}
        <div className="px-6 pt-4 pb-2">
          <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
            Number of incidents by week in {incidentsByWeek?.year || 2025}
            <span className="ml-2 text-muted-foreground/70 normal-case font-normal">
              {incidentsByWeek ? `(${incidentsByWeek.totalIncidents} total)` : ''}
            </span>
          </h4>
        </div>

        {incidentsByWeekLoading ? (
          <LoadingSkeleton />
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
              <LoadingSkeleton />
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
              <LoadingSkeleton />
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

            {/* Subsection 9: Incident by Release by Day */}
            <div className="px-6 pt-4 pb-2">
              <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
                {incidentsByReleaseByDayData?.monthName || 'Month'} Incident by Release by Day
              </h4>
            </div>

            {incidentsByReleaseByDayLoading ? (
              <LoadingSkeleton />
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

            {/* Subsection 10: Change Release by Module */}
            <div className="px-6 pt-4 pb-2">
              <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-wider">
                {changeReleaseByModuleData?.monthName || 'Month'} Change Release by Module
              </h4>
            </div>

            {changeReleaseByModuleLoading ? (
              <LoadingSkeleton />
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

      {/* Modals */}
      <UnmappedRequestsModal
        open={unmappedModalOpen}
        onOpenChange={setUnmappedModalOpen}
        applicationName={unmappedModalApp}
        requests={unmappedModalData}
      />
      <UnassignedRecurrencyModal
        open={unassignedRecurrencyModalOpen}
        onOpenChange={setUnassignedRecurrencyModalOpen}
        categoryName={unassignedRecurrencyModalCategory}
        requests={unassignedRecurrencyModalData}
      />
    </>
  );
}
