'use client';

import { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { Application } from '@/modules/analytics-dashboard/types';

interface ParentTicketRow {
  createdDate: string;
  linkedRequestId: string;
  linkedRequestIdLink: string | null;
  additionalInfo: string;
  totalLinkedTickets: number;
  linkedTicketsInMonth: number;
  requestStatus: string;
  eta: string;
}

interface ParentTicketData {
  data: ParentTicketRow[];
  monthName: string;
  totalIncidents: number;
}

interface ParentTicketSectionProps {
  title: string;
  selectedApp: string;
  selectedMonth: string;
  isMonthlyMode: boolean;
  applications: Application[];
  fetchData: (app: string, month: string) => Promise<ParentTicketData | null>;
  colorScheme: 'amber' | 'red';
}

const colorClasses = {
  amber: {
    border: 'border-amber-500/20',
    borderHover: 'hover:border-amber-500/30',
    shadow: 'shadow-amber-500/10',
    headerBg: 'from-amber-500/10',
    rowBorder: 'border-amber-500/10',
    rowHover: 'hover:bg-amber-500/5',
    headerRowBorder: 'border-b border-amber-500/20',
    headerRowHover: 'hover:bg-amber-500/5',
    linkColor: 'text-amber-400 hover:text-amber-300',
    totalBorder: 'border-t-2 border-amber-500/30',
    totalBg: 'bg-amber-500/10',
  },
  red: {
    border: 'border-red-500/20',
    borderHover: 'hover:border-red-500/30',
    shadow: 'shadow-red-500/10',
    headerBg: 'from-red-500/10',
    rowBorder: 'border-red-500/10',
    rowHover: 'hover:bg-red-500/5',
    headerRowBorder: 'border-b border-red-500/20',
    headerRowHover: 'hover:bg-red-500/5',
    linkColor: 'text-red-400 hover:text-red-300',
    totalBorder: 'border-t-2 border-red-500/30',
    totalBg: 'bg-red-500/10',
  },
};

export function ParentTicketSection({
  title,
  selectedApp,
  selectedMonth,
  isMonthlyMode,
  applications,
  fetchData,
  colorScheme,
}: ParentTicketSectionProps) {
  const [data, setData] = useState<ParentTicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await fetchData(selectedApp, selectedMonth);
      setData(result);
      setLoading(false);
    };
    load();
  }, [selectedApp, selectedMonth, fetchData]);

  const colors = colorClasses[colorScheme];

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  const monthLabel = DateTime.fromFormat(selectedMonth, 'yyyy-MM').toFormat('MMMM yyyy');

  return (
    <div className={`mt-8 rounded-2xl border ${colors.border} bg-card/60 overflow-hidden shadow-2xl ${colors.shadow} backdrop-blur-sm ${colors.borderHover} transition-all duration-300`}>
      <div className={`px-6 py-6 border-b ${colors.border} bg-gradient-to-r ${colors.headerBg} to-jpc-vibrant-purple-500/5`}>
        <h3 className="text-sm font-bold text-foreground">
          {title}
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            {data ? `(${data.totalIncidents} total in ${data.monthName})` : ''}
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Filters: {appLabel} | {monthLabel} |{' '}
          <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>
            {isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}
          </span>
          <span className="mx-2">|</span>
          Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>, <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">problems</code>, <code className="px-1 py-0.5 rounded bg-muted/50">parent_child_requests</code>
        </p>
      </div>

      {loading ? (
        <div className="p-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No {title.toLowerCase().includes('bug') ? 'bug' : 'missing scope'} incidents found for the selected filters
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={`${colors.headerRowBorder} ${colors.headerRowHover}`}>
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
              {data.data.map((row, index) => {
                const isUnassigned = !row.linkedRequestId;
                return (
                  <TableRow
                    key={row.linkedRequestId || `unassigned-${index}`}
                    className={`border-b ${colors.rowBorder} ${colors.rowHover} transition-colors`}
                  >
                    <TableCell className="text-sm text-foreground/80">
                      {isUnassigned ? '' : (row.createdDate || '-')}
                    </TableCell>
                    <TableCell className={`font-medium ${colors.linkColor.split(' ')[0]}`}>
                      {isUnassigned ? '' : row.linkedRequestIdLink ? (
                        <a
                          href={row.linkedRequestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${colors.linkColor} hover:underline transition-colors`}
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
                      {isUnassigned ? '' : (row.totalLinkedTickets || '-')}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/90 text-right font-semibold">
                      {row.linkedTicketsInMonth}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">
                      {isUnassigned ? '' : (row.requestStatus || '-')}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">
                      {isUnassigned ? '' : (row.eta || '-')}
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* TOTAL Row */}
              <TableRow className={`${colors.totalBorder} ${colors.totalBg} font-bold`}>
                <TableCell className="text-sm text-foreground font-bold">TOTAL</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-sm text-foreground text-right font-bold">
                  {data.totalIncidents}
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
