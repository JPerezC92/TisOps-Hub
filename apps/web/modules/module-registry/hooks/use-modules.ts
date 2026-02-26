import { useQuery } from '@tanstack/react-query';
import { moduleRegistryService } from '../services/module-registry.service';
import { moduleRegistryKeys } from '../keys';

export function useModules() {
  return useQuery({
    queryKey: moduleRegistryKeys.all,
    queryFn: moduleRegistryService.getAll,
  });
}
