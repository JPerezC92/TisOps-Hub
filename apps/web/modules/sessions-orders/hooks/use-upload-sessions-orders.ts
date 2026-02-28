import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsOrdersService } from '../services/sessions-orders.service';
import { sessionsOrdersKeys } from '../keys';

export function useUploadSessionsOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => sessionsOrdersService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionsOrdersKeys.all });
    },
    onError: (error) => {
      console.error('Upload sessions orders failed:', error);
    },
    retry: 0,
  });
}
