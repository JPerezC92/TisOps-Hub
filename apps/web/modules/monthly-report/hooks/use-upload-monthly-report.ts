import { useMutation, useQueryClient } from '@tanstack/react-query';
import { monthlyReportService } from '../services/monthly-report.service';
import { monthlyReportKeys } from '../keys';

export function useUploadMonthlyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => monthlyReportService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: monthlyReportKeys.all });
    },
    onError: (error) => {
      console.error('Upload monthly report failed:', error);
    },
    retry: 0,
  });
}
