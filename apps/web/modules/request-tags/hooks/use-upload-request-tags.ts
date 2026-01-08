import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { requestTagsKeys } from '@/modules/request-tags/keys';

export function useUploadRequestTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestTagsService.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestTagsKeys.all });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
}
