import { useQuery } from '@tanstack/react-query';
import { weeklyCorrectiveService } from '../services/weekly-corrective.service';
import { weeklyCorrectiveKeys } from '../keys';

export function useWeeklyCorrectives() {
  return useQuery({
    queryKey: weeklyCorrectiveKeys.all,
    queryFn: weeklyCorrectiveService.getAll,
  });
}
