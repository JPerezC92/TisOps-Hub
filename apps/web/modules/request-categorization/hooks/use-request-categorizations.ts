import { useQuery } from '@tanstack/react-query';
import { requestCategorizationService } from '../services/request-categorization.service';
import { requestCategorizationKeys } from '../keys';

export function useRequestCategorizations() {
  return useQuery({
    queryKey: requestCategorizationKeys.all,
    queryFn: requestCategorizationService.getAll,
  });
}
