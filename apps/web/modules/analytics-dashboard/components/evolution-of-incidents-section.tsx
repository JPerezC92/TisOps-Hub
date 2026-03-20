'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import { groupTickets } from '@/modules/analytics-dashboard/utils';
import { RequestIdsModal } from '@/modules/analytics-dashboard/components/request-ids-modal';
import type { Application, ModuleEvolutionResponse, RequestIdWithLink } from '@/modules/analytics-dashboard/types';

interface EvolutionOfIncidentsSectionProps {
  selectedApp: string;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  isMonthlyMode: boolean;
  lastDayOfMonth: string;
  applications: Application[];
}

export function EvolutionOfIncidentsSection({
  selectedApp,
  startDate,
  endDate,
  isMonthlyMode,
  lastDayOfMonth,
  applications,
}: EvolutionOfIncidentsSectionProps) {
  const [data, setData] = useState<ModuleEvolutionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTicketDetails, setShowTicketDetails] = useState(false);

  // Modal state for ticket group details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalRequestIds, setModalRequestIds] = useState<RequestIdWithLink[]>([]);
  const [modalGroupTitle, setModalGroupTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = isMonthlyMode
        ? await analyticsDashboardService.getModuleEvolutionMonthly(selectedApp, lastDayOfMonth)
        : await analyticsDashboardService.getModuleEvolution(selectedApp, startDate, endDate);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [selectedApp, startDate, endDate, isMonthlyMode, lastDayOfMonth]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  return (
    <>
      <div className="mt-8 rounded-2xl border border-jpc-vibrant-emerald-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-emerald-500/10 backdrop-blur-sm hover:border-jpc-vibrant-emerald-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-jpc-vibrant-emerald-500/20 bg-gradient-to-r from-jpc-vibrant-emerald-500/10 to-jpc-vibrant-purple-500/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Evolution of Incidents
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                {data ? `${data.total} incidents across ${data.data.length} modules` : 'Loading...'}
              </span>
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filters: {appLabel} | {isMonthlyMode ? lastDayOfMonth : `${startDate} to ${endDate}`} |{' '}
              <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>
                {isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}
              </span>
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

        {loading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.data.length === 0 ? (
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
                {data.data.map((moduleItem) => (
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

      <RequestIdsModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={modalGroupTitle}
        requestIds={modalRequestIds}
      />
    </>
  );
}
