import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monthlyReportStatusRegistryService, CreateMonthlyReportStatusDto } from '../services/monthly-report-status-registry.service';
import { monthlyReportStatusRegistryKeys } from '../keys';

export function useCreateMonthlyReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonthlyReportStatusDto) =>
      monthlyReportStatusRegistryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monthlyReportStatusRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Create monthly report status failed:', error);
    },
    retry: 0,
  });
}
