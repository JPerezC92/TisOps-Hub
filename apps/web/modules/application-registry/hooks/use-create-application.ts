import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import type { CreateApplicationData } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApplicationData) => applicationRegistryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationRegistryKeys.all });
    },
    retry: 0,
  });
}
