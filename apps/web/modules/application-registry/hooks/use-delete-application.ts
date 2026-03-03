import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => applicationRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationRegistryKeys.all });
    },
    retry: 0,
  });
}
