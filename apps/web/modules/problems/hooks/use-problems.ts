import { useQuery } from '@tanstack/react-query';
import { problemsService } from '../services/problems.service';
import { problemsKeys } from '../keys';

export function useProblems() {
  return useQuery({
    queryKey: problemsKeys.all,
    queryFn: problemsService.getAll,
  });
}
