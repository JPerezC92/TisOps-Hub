import { useMutation, useQueryClient } from '@tanstack/react-query';
import { correctiveStatusRegistryService } from '../services/corrective-status-registry.service';
import { correctiveStatusRegistryKeys } from '../keys';
import type { CreateCorrectiveStatusDto } from '../services/corrective-status-registry.service';

export function useCreateCorrectiveStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCorrectiveStatusDto) =>
      correctiveStatusRegistryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: correctiveStatusRegistryKeys.all });
      queryClient.invalidateQueries({
        queryKey: correctiveStatusRegistryKeys.displayStatusOptions(),
      });
    },
    onError: (error) => {
      console.error('Create corrective status failed:', error);
    },
    retry: 0,
  });
}
