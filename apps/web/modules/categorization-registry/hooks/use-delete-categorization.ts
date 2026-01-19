import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categorizationRegistryService } from '../services/categorization-registry.service';
import { categorizationRegistryKeys } from '../keys';

export function useDeleteCategorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categorizationRegistryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Delete categorization failed:', error);
    },
    retry: 0,
  });
}
