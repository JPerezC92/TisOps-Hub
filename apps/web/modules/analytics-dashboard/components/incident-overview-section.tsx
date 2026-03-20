'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { Application, IncidentOverviewByCategoryResponse } from '@/modules/analytics-dashboard/types';

interface IncidentOverviewSectionProps {
  selectedApp: string;
  startDate: string;
  endDate: string;
  isMonthlyMode: boolean;
  lastDayOfMonth: string;
  applications: Application[];
}

export function IncidentOverviewSection({
  selectedApp,
  startDate,
  endDate,
  isMonthlyMode,
  lastDayOfMonth,
  applications,
}: IncidentOverviewSectionProps) {
  const [data, setData] = useState<IncidentOverviewByCategoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = isMonthlyMode
        ? await analyticsDashboardService.getIncidentOverviewMonthly(selectedApp, lastDayOfMonth)
        : await analyticsDashboardService.getIncidentOverview(selectedApp, startDate, endDate);
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
    <div className="mt-8">
      <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            Incident Overview by Category
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Filters: {appLabel} | {isMonthlyMode ? lastDayOfMonth : `${startDate} to ${endDate}`} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
            <span className="mx-2">|</span>
            Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
          </p>
        </div>
        {data && (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-jpc-vibrant-cyan-400">{data.recurrentInL2L3.total}</span> requests of the week
          </span>
        )}
      </div>

      {loading ? (
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
      ) : !data ? (
        <div className="p-8 text-center text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="p-6 space-y-6">
          {/* Row 1: 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Resolved in L2 */}
            <CategoryCard
              title="Resolved in L2"
              subtitle="Distribution by category"
              description="Incidents resolved by Level 2 support team during the current week, grouped by incident category"
              data={data.resolvedInL2.data.map((item) => ({
                label: item.categoryDisplayValue || item.category,
                title: item.category,
                count: item.count,
                percentage: item.percentage,
              }))}
              total={data.resolvedInL2.total}
              footerText={`${data.resolvedInL2.total} Resolved tickets of the Week`}
            />

            {/* Card 2: Pending */}
            <CategoryCard
              title="Pending"
              subtitle="Distribution by category"
              description="Incidents currently being handled by Level 2 support team, pending resolution"
              data={data.pending.data.map((item) => ({
                label: item.categoryDisplayValue || item.category,
                title: item.category,
                count: item.count,
                percentage: item.percentage,
              }))}
              total={data.pending.total}
              footerText={`${data.pending.total} pending tickets of the Week`}
            />

            {/* Card 3: Recurrent in L2 & L3 */}
            <CategoryCard
              title="Recurrent in L2 & L3"
              subtitle="Distribution by recurrency"
              description="Analysis of incident recurrence patterns to identify unique vs recurring issues"
              data={data.recurrentInL2L3.data.map((item) => ({
                label: item.category,
                count: item.count,
                percentage: item.percentage,
              }))}
              total={data.recurrentInL2L3.total}
              footerText={`${data.recurrentInL2L3.total} tickets of the Week`}
            />
          </div>

          {/* Row 2: 2 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 4: Assigned to L3 Backlog */}
            <CategoryCard
              title="Assigned to L3 Backlog"
              subtitle="Distribution by Categorie"
              description="Incidents escalated to Level 3 support or currently in the backlog awaiting assignment"
              data={data.assignedToL3Backlog.data.map((item) => ({
                label: item.categoryDisplayValue || item.category,
                title: item.category,
                count: item.count,
                percentage: item.percentage,
              }))}
              total={data.assignedToL3Backlog.total}
              footerText={`${data.assignedToL3Backlog.total} pending tickets of the Week`}
            />

            {/* Card 5: L3 Status */}
            <L3StatusCard
              data={data.l3Status}
              selectedApp={selectedApp}
              startDate={startDate}
              lastDayOfMonth={lastDayOfMonth}
              isMonthlyMode={isMonthlyMode}
              applications={applications}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryCardProps {
  title: string;
  subtitle: string;
  description: string;
  data: { label: string; title?: string; count: number; percentage: number }[];
  total: number;
  footerText: string;
}

function CategoryCard({ title, subtitle, description, data, total, footerText }: CategoryCardProps) {
  return (
    <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
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
            {data.map((item) => (
              <TableRow key={item.label} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                <TableCell className="text-xs text-foreground/80">
                  {item.title ? (
                    <span title={item.title}>{item.label}</span>
                  ) : (
                    item.label
                  )}
                </TableCell>
                <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
              <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
              <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{total}</TableCell>
              <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
        <p className="text-xs text-jpc-vibrant-cyan-400 italic">{footerText}</p>
      </div>
    </div>
  );
}

interface L3StatusCardProps {
  data: { data: { status: string; count: number; percentage: number }[]; total: number };
  selectedApp: string;
  startDate: string;
  lastDayOfMonth: string;
  isMonthlyMode: boolean;
  applications: Application[];
}

function L3StatusCard({ data, selectedApp, startDate, lastDayOfMonth, isMonthlyMode, applications }: L3StatusCardProps) {
  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  return (
    <div className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-transparent">
        <h4 className="text-sm font-bold text-foreground">L3 Status</h4>
        <p className="text-xs text-muted-foreground mt-0.5">Distribution by Status</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Level 3 incident status distribution from previous periods, showing backlog evolution over time</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          {isMonthlyMode
            ? <>Filters: {appLabel} | {lastDayOfMonth} | Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code></>
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
            {data.data.map((item) => (
              <TableRow key={item.status} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/5">
                <TableCell className="text-xs text-foreground/80">{item.status}</TableCell>
                <TableCell className="text-xs text-jpc-vibrant-cyan-400 text-right font-semibold">{item.count}</TableCell>
                <TableCell className="text-xs text-foreground/70 text-right">{item.percentage.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-jpc-vibrant-cyan-500/30 bg-jpc-vibrant-cyan-500/10">
              <TableCell className="text-xs font-bold text-foreground">TOTAL</TableCell>
              <TableCell className="text-xs font-bold text-jpc-vibrant-cyan-400 text-right">{data.total}</TableCell>
              <TableCell className="text-xs font-bold text-foreground text-right">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="px-4 py-2 bg-jpc-vibrant-cyan-500/5 border-t border-jpc-vibrant-cyan-500/10">
        <p className="text-xs text-jpc-vibrant-cyan-400 italic">{data.total} tickets previous week</p>
      </div>
    </div>
  );
}
