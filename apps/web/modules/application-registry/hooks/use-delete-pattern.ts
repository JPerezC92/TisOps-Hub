import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useDeletePattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patternId: number) => applicationRegistryService.deletePattern(patternId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationRegistryKeys.all });
    },
    retry: 0,
  });
}
