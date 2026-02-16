import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctiveStatusRegistryService } from '../services/corrective-status-registry.service';
import { correctiveStatusRegistryKeys } from '../keys';
import type { UpdateCorrectiveStatusDto } from '../services/corrective-status-registry.service';

export function useUpdateCorrectiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCorrectiveStatusDto }) =>
      correctiveStatusRegistryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correctiveStatusRegistryKeys.all });
      queryClient.invalidateQueries({
        queryKey: correctiveStatusRegistryKeys.displayStatusOptions(),
      });
    },
    onError: (error) => {
      console.error('Update corrective status failed:', error);
    },
    retry: 0,
  });
}
