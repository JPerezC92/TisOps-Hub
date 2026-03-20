'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { Application, L3RequestDetail, L3RequestsByStatusResponse } from '@/modules/analytics-dashboard/types';

interface L3RequestsByStatusSectionProps {
  selectedApp: string;
  isMonthlyMode: boolean;
  applications: Application[];
}

export function L3RequestsByStatusSection({
  selectedApp,
  isMonthlyMode,
  applications,
}: L3RequestsByStatusSectionProps) {
  const [data, setData] = useState<L3RequestsByStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await analyticsDashboardService.getL3RequestsByStatus(selectedApp);
      setData(result);
      setLoading(false);
    };
    fetchData();
  }, [selectedApp]);

  const appLabel =
    selectedApp === 'all'
      ? 'All Applications'
      : applications.find((a) => a.code === selectedApp)?.name || selectedApp;

  if (loading) {
    return (
      <div className="mt-8 p-8">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return null;

  const sections: { title: string; requests: L3RequestDetail[] }[] = [
    { title: 'Ready to deploy', requests: data.prdDeployment },
    { title: 'In testing', requests: data.inTesting },
    { title: 'Dev in progress', requests: data.devInProgress },
    { title: 'In backlog', requests: data.inBacklog },
  ];

  return (
    <div className="mt-8 space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="rounded-xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 flex items-center justify-between bg-jpc-vibrant-cyan-500/5">
            <div>
              <h4 className="text-md font-semibold text-foreground">
                {section.title}
              </h4>
              <p className="text-xs text-muted-foreground/50">
                Filters: {appLabel} | <span className={isMonthlyMode ? 'text-jpc-vibrant-purple-400' : 'text-jpc-vibrant-cyan-400'}>{isMonthlyMode ? 'Monthly Report' : 'Weekly Report'}</span>
                <span className="mx-2">|</span>
                Source: <code className="px-1 py-0.5 rounded bg-muted/50">weekly_correctives</code> + <code className="px-1 py-0.5 rounded bg-muted/50">monthly_reports</code> (Nivel 3)
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-jpc-vibrant-cyan-400">{section.requests.length}</span> request(s)
            </span>
          </div>
          {section.requests.length === 0 ? (
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
                  {section.requests.map((req, index) => (
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
      ))}
    </div>
  );
}
