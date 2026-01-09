'use client';

import { useQueryClient } from '@tanstack/react-query';
import { StatsGrid } from '@/components/stats-grid';
import { useErrorLogs } from '../hooks/use-error-logs';
import { errorLogsKeys } from '../keys';

export function ErrorLogsStats() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useErrorLogs(100);
  const errorLogs = data?.logs ?? [];

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: errorLogsKeys.all });
  };

  const statsData = [
    {
      label: 'TOTAL ERRORS',
      value: errorLogs.length.toString(),
      color: 'cyan' as const,
    },
    {
      label: 'DATABASE ERRORS',
      value: errorLogs
        .filter((e) => e.errorType === 'DatabaseError')
        .length.toString(),
      color: 'orange' as const,
    },
    {
      label: 'LAST 24H',
      value: errorLogs
        .filter(
          (e) =>
            new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        )
        .length.toString(),
      color: 'purple' as const,
    },
  ];

  return <StatsGrid stats={statsData} onRefresh={handleRefresh} loading={isLoading} />;
}
