import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsOrdersService } from '../services/sessions-orders.service';
import { sessionsOrdersKeys } from '../keys';

export function useDeleteSessionsOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sessionsOrdersService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsOrdersKeys.all });
    },
    onError: (error) => {
      console.error('Delete all sessions orders failed:', error);
    },
    retry: 0,
  });
}
