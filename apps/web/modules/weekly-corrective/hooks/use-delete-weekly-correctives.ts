import { useMutation, useQueryClient } from '@tanstack/react-query';
import { weeklyCorrectiveService } from '../services/weekly-corrective.service';
import { weeklyCorrectiveKeys } from '../keys';

export function useDeleteWeeklyCorrectives() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => weeklyCorrectiveService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: weeklyCorrectiveKeys.all });
    },
    onError: (error) => {
      console.error('Delete all weekly correctives failed:', error);
    },
    retry: 0,
  });
}
