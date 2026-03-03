import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import type { CreatePatternData } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useCreatePattern() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, data }: { appId: number; data: CreatePatternData }) =>
      applicationRegistryService.createPattern(appId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationRegistryKeys.all });
    },
    retry: 0,
  });
}
