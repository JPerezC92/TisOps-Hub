import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleRegistryService } from '../services/module-registry.service';
import { moduleRegistryKeys } from '../keys';

export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => moduleRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Delete module failed:', error);
    },
    retry: 0,
  });
}
