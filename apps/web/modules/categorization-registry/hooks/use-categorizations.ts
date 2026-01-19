import { useQuery } from '@tanstack/react-query';
import { categorizationRegistryService } from '../services/categorization-registry.service';
import { categorizationRegistryKeys } from '../keys';

export function useCategorizations() {
  return useQuery({
    queryKey: categorizationRegistryKeys.all,
    queryFn: categorizationRegistryService.getAll,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
