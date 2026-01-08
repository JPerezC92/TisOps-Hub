import { useQuery } from '@tanstack/react-query';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { requestTagsKeys } from '@/modules/request-tags/keys';

export function useRequestTags() {
  return useQuery({
    queryKey: requestTagsKeys.all,
    queryFn: requestTagsService.getAll,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
