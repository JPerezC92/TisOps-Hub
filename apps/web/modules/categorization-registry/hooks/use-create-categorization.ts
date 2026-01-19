import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categorizationRegistryService, CreateCategorizationDto } from '../services/categorization-registry.service';
import { categorizationRegistryKeys } from '../keys';

export function useCreateCategorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategorizationDto) =>
      categorizationRegistryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Create categorization failed:', error);
    },
    retry: 0,
  });
}
