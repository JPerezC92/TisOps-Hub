'use client';

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MonthlyReport, Application } from '@/modules/analytics-dashboard/types';

interface CriticalIncidentsSectionProps {
  selectedApp: string;
  selectedMonth: string;
  isMonthlyMode: boolean;
  applications: Application[];
}

export function CriticalIncidentsSection({
  selectedApp,
  selectedMonth,
  isMonthlyMode,
  applications,
}: CriticalIncidentsSectionProps) {
  const [criticalIncidents, setCriticalIncidents] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCriticalIncidents = async () => {
      setLoading(true);
      const result = await analyticsDashboardService.getCriticalIncidents(selectedApp, selectedMonth);
      setCriticalIncidents(result);
      setLoading(false);
    };
    fetchCriticalIncidents();
  }, [selectedApp, selectedMonth]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  const monthLabel = DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy');

  return (
    <div className="mt-8 rounded-2xl border border-jpc-vibrant-orange-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-orange-500/10 backdrop-blur-sm hover:border-jpc-vibrant-orange-500/30 transition-all duration-300">
      <div className="px-6 py-6 border-b border-jpc-vibrant-orange-500/20 bg-gradient-to-r from-jpc-vibrant-orange-500/10 to-jpc-vibrant-purple-500/5">
        <h3 className="text-sm font-bold text-foreground">
          Critical Incidents
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            Showing {criticalIncidents.length} critical priority incidents from monthly reports
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Filters: {appLabel} | {monthLabel} |{' '}
          <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>
            {isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}
          </span>
          <span className="mx-2">|</span>
          Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
        </p>
      </div>

      {loading ? (
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
  );
}
