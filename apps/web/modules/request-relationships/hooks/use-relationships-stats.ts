import { useQuery } from '@tanstack/react-query';
import { requestRelationshipsService } from '../services/request-relationships.service';
import { requestRelationshipsKeys } from '../keys';

export function useRelationshipsStats() {
  return useQuery({
    queryKey: requestRelationshipsKeys.stats(),
    queryFn: requestRelationshipsService.getStats,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
