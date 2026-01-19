import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monthlyReportStatusRegistryService } from '../services/monthly-report-status-registry.service';
import { monthlyReportStatusRegistryKeys } from '../keys';

export function useDeleteMonthlyReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => monthlyReportStatusRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monthlyReportStatusRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Delete monthly report status failed:', error);
    },
    retry: 0,
  });
}
