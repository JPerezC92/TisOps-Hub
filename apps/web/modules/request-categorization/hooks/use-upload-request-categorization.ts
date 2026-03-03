import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestCategorizationService } from '../services/request-categorization.service';
import { requestCategorizationKeys } from '../keys';

export function useUploadRequestCategorization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => requestCategorizationService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestCategorizationKeys.all });
      queryClient.invalidateQueries({ queryKey: requestCategorizationKeys.summary() });
    },
    onError: (error) => {
      console.error('Upload request categorization failed:', error);
    },
    retry: 0,
  });
}
