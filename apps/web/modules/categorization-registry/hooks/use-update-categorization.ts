import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categorizationRegistryService, UpdateCategorizationDto } from '../services/categorization-registry.service';
import { categorizationRegistryKeys } from '../keys';

interface UpdateCategorizationParams {
  id: number;
  data: UpdateCategorizationDto;
}

export function useUpdateCategorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateCategorizationParams) =>
      categorizationRegistryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categorizationRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Update categorization failed:', error);
    },
    retry: 0,
  });
}
