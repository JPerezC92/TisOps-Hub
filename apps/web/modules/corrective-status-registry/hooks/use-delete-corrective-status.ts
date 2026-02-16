import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctiveStatusRegistryService } from '../services/corrective-status-registry.service';
import { correctiveStatusRegistryKeys } from '../keys';

export function useDeleteCorrectiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => correctiveStatusRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correctiveStatusRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Delete corrective status failed:', error);
    },
    retry: 0,
  });
}
