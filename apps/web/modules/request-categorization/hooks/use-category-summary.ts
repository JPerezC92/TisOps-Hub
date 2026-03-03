import { useQuery } from '@tanstack/react-query';
import { requestCategorizationService } from '../services/request-categorization.service';
import { requestCategorizationKeys } from '../keys';

export function useCategorySummary() {
  return useQuery({
    queryKey: requestCategorizationKeys.summary(),
    queryFn: requestCategorizationService.getSummary,
  });
}
