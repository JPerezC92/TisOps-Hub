import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleRegistryService } from '../services/module-registry.service';
import { moduleRegistryKeys } from '../keys';
import type { CreateModuleDto } from '../services/module-registry.service';

export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModuleDto) =>
      moduleRegistryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Create module failed:', error);
    },
    retry: 0,
  });
}
