import { useQuery } from '@tanstack/react-query';
import { monthlyReportStatusRegistryService } from '../services/monthly-report-status-registry.service';
import { monthlyReportStatusRegistryKeys } from '../keys';

export function useMonthlyReportStatuses() {
  return useQuery({
    queryKey: monthlyReportStatusRegistryKeys.all,
    queryFn: monthlyReportStatusRegistryService.getAll,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
