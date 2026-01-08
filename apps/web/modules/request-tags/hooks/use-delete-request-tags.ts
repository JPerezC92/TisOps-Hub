import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { requestTagsKeys } from '@/modules/request-tags/keys';

export function useDeleteRequestTags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestTagsService.deleteAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestTagsKeys.all });
    },
    onError: (error) => {
      console.error('Delete failed:', error);
    },
    retry: 0,
  });
}
