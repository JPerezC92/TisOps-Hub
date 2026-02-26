import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moduleRegistryService } from '../services/module-registry.service';
import { moduleRegistryKeys } from '../keys';
import type { UpdateModuleDto } from '../services/module-registry.service';

export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateModuleDto }) =>
      moduleRegistryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moduleRegistryKeys.all });
    },
    onError: (error) => {
      console.error('Update module failed:', error);
    },
    retry: 0,
  });
}
