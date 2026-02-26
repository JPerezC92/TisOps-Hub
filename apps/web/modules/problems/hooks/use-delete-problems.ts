import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsService } from '../services/problems.service';
import { problemsKeys } from '../keys';

export function useDeleteProblems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => problemsService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemsKeys.all });
    },
    onError: (error) => {
      console.error('Delete all problems failed:', error);
    },
    retry: 0,
  });
}
