import { useQuery } from '@tanstack/react-query';
import { correctiveStatusRegistryService } from '../services/corrective-status-registry.service';
import { correctiveStatusRegistryKeys } from '../keys';

export function useCorrectiveStatuses() {
  return useQuery({
    queryKey: correctiveStatusRegistryKeys.all,
    queryFn: correctiveStatusRegistryService.getAll,
  });
}
