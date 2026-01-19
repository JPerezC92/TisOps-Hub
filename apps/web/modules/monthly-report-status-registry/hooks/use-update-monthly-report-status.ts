import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monthlyReportStatusRegistryService, UpdateMonthlyReportStatusDto } from '../services/monthly-report-status-registry.service';
import { monthlyReportStatusRegistryKeys } from '../keys';

interface UpdateMonthlyReportStatusParams {
  id: number;
  data: UpdateMonthlyReportStatusDto;
}

export function useUpdateMonthlyReportStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateMonthlyReportStatusParams) =>
      monthlyReportStatusRegistryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monthlyReportStatusRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Update monthly report status failed:', error);
    },
    retry: 0,
  });
}
