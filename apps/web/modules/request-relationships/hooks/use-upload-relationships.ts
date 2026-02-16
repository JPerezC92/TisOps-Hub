import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestRelationshipsService } from '../services/request-relationships.service';
import { requestRelationshipsKeys } from '../keys';

export function useUploadRelationships() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => requestRelationshipsService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestRelationshipsKeys.all });
    },
    onError: (error) => {
      console.error('Upload relationships failed:', error);
    },
    retry: 0,
  });
}
