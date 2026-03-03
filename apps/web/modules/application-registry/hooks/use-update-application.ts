import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import type { UpdateApplicationData } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateApplicationData }) =>
      applicationRegistryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationRegistryKeys.all });
    },
    retry: 0,
  });
}
