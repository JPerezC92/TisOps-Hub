'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { Application, L3SummaryResponse } from '@/modules/analytics-dashboard/types';

interface L3SummarySectionProps {
  selectedApp: string;
  isMonthlyMode: boolean;
  applications: Application[];
}

export function L3SummarySection({
  selectedApp,
  isMonthlyMode,
  applications,
}: L3SummarySectionProps) {
  const [data, setData] = useState<L3SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await analyticsDashboardService.getL3Summary(selectedApp);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [selectedApp]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  return (
    <div className="mt-8">
      <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            L3 Summary
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Filters: {appLabel} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
            <span className="mx-2">|</span>
            Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code>, <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code>
          </p>
        </div>
        {data && (
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-jpc-vibrant-cyan-400">{data.totals.total}</span> pending code fixes
          </span>
        )}
      </div>

      {loading ? (
        <div className="p-8">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !data ? (
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
                  {data.data.map((row) => (
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
                      {data.totals.critical > 0 ? (
                        <span className="text-red-400">{data.totals.critical}</span>
                      ) : (
                        <span className="text-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-center font-bold">
                      {data.totals.high > 0 ? (
                        <span className="text-orange-400">{data.totals.high}</span>
                      ) : (
                        <span className="text-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-center font-bold">
                      {data.totals.medium > 0 ? (
                        <span className="text-yellow-400">{data.totals.medium}</span>
                      ) : (
                        <span className="text-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-center font-bold">
                      {data.totals.low > 0 ? (
                        <span className="text-green-400">{data.totals.low}</span>
                      ) : (
                        <span className="text-foreground/50">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-center font-bold text-jpc-vibrant-cyan-400">{data.totals.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
