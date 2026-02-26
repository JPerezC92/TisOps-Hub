import { useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsService } from '../services/problems.service';
import { problemsKeys } from '../keys';

export function useUploadProblems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => problemsService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: problemsKeys.all });
    },
    onError: (error) => {
      console.error('Upload problems failed:', error);
    },
    retry: 0,
  });
}
