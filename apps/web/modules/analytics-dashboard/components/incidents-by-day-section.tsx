'use client';

import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { Application, IncidentsByDayResponse } from '@/modules/analytics-dashboard/types';

interface IncidentsByDaySectionProps {
  selectedApp: string;
  endDay: number;
  applications: Application[];
}

export function IncidentsByDaySection({
  selectedApp,
  endDay,
  applications,
}: IncidentsByDaySectionProps) {
  const [data, setData] = useState<IncidentsByDayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const result = await analyticsDashboardService.getIncidentsByDay(selectedApp);
      setData(result);
      setLoading(false);
    };
    fetch();
  }, [selectedApp]);

  const allDays = useMemo(() => {
    if (!data) return [];
    const countByDay = new Map(data.data.map((row) => [row.day, row.count]));
    return Array.from({ length: endDay }, (_, i) => ({
      day: i + 1,
      count: countByDay.get(i + 1) ?? 0,
    }));
  }, [data, endDay]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  return (
    <div className="mt-8 rounded-2xl border border-jpc-vibrant-emerald-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-emerald-500/10 backdrop-blur-sm hover:border-jpc-vibrant-emerald-500/30 transition-all duration-300">
      <div className="px-6 py-6 border-b border-jpc-vibrant-emerald-500/20 bg-gradient-to-r from-jpc-vibrant-emerald-500/10 to-jpc-vibrant-purple-500/5">
        <h3 className="text-sm font-bold text-foreground">
          Incidents by Day
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            {data ? `${data.totalIncidents} incidents` : 'Loading...'}
          </span>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Filters: {appLabel}
          <span className="mx-2">|</span>
          Source: <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
        </p>
      </div>
      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jpc-vibrant-emerald-500"></div>
        </div>
      ) : data && allDays.length > 0 ? (
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-jpc-vibrant-emerald-500/20 hover:bg-transparent">
                <TableHead className="text-xs font-bold text-foreground/80 uppercase tracking-wider">day</TableHead>
                <TableHead className="text-xs font-bold text-foreground/80 uppercase tracking-wider text-right">Incidents</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allDays.map((row) => (
                <TableRow key={row.day} className={`border-b border-jpc-vibrant-emerald-500/10 hover:bg-jpc-vibrant-emerald-500/5 transition-colors ${row.count === 0 ? 'opacity-40' : ''}`}>
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
  );
}
