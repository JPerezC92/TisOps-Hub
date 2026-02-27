import { useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyCorrectiveService } from '../services/weekly-corrective.service';
import { weeklyCorrectiveKeys } from '../keys';

export function useUploadWeeklyCorrectives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => weeklyCorrectiveService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weeklyCorrectiveKeys.all });
    },
    onError: (error) => {
      console.error('Upload weekly correctives failed:', error);
    },
    retry: 0,
  });
}
