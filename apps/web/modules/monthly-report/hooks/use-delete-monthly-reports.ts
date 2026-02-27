import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monthlyReportService } from '../services/monthly-report.service';
import { monthlyReportKeys } from '../keys';

export function useDeleteMonthlyReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => monthlyReportService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monthlyReportKeys.all });
    },
    onError: (error) => {
      console.error('Delete all monthly reports failed:', error);
    },
    retry: 0,
  });
}
