import { useQuery } from '@tanstack/react-query';
import { applicationRegistryService } from '../services/application-registry.service';
import { applicationRegistryKeys } from '../keys';

export function useApplicationsWithPatterns() {
  return useQuery({
    queryKey: applicationRegistryKeys.withPatterns(),
    queryFn: applicationRegistryService.getAllWithPatterns,
  });
}
