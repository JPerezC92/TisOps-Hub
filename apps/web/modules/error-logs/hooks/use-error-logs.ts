import { useQuery } from '@tanstack/react-query';
import { errorLogsKeys } from '../keys';
import { errorLogsService } from '../services/error-logs.service';

export function useErrorLogs(limit: number = 50) {
  return useQuery({
    queryKey: errorLogsKeys.list(limit),
    queryFn: () => errorLogsService.getAll(limit),
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
