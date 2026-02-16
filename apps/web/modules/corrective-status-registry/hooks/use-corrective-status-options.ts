import { useQuery } from '@tanstack/react-query';
import { correctiveStatusRegistryService } from '../services/corrective-status-registry.service';
import { correctiveStatusRegistryKeys } from '../keys';

export function useCorrectiveStatusOptions() {
  return useQuery({
    queryKey: correctiveStatusRegistryKeys.displayStatusOptions(),
    queryFn: correctiveStatusRegistryService.getDisplayStatusOptions,
  });
}
