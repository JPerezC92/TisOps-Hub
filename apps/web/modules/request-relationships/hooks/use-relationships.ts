import { useQuery } from '@tanstack/react-query';
import { requestRelationshipsService } from '../services/request-relationships.service';
import { requestRelationshipsKeys } from '../keys';

export function useRelationships(limit = 100, offset = 0) {
  return useQuery({
    queryKey: requestRelationshipsKeys.list(limit, offset),
    queryFn: () => requestRelationshipsService.getAll(limit, offset),
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
