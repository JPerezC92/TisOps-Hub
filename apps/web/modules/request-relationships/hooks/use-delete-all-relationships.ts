import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestRelationshipsService } from '../services/request-relationships.service';
import { requestRelationshipsKeys } from '../keys';

export function useDeleteAllRelationships() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestRelationshipsService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestRelationshipsKeys.all });
    },
    onError: (error) => {
      console.error('Delete all relationships failed:', error);
    },
    retry: 0,
  });
}
