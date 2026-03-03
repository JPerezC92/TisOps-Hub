import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestCategorizationService } from '../services/request-categorization.service';
import { requestCategorizationKeys } from '../keys';

export function useDeleteRequestCategorizations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => requestCategorizationService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestCategorizationKeys.all });
      queryClient.invalidateQueries({ queryKey: requestCategorizationKeys.summary() });
    },
    onError: (error) => {
      console.error('Delete all request categorizations failed:', error);
    },
    retry: 0,
  });
}
