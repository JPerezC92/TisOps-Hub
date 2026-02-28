import { useQuery } from '@tanstack/react-query';
import { sessionsOrdersService } from '../services/sessions-orders.service';
import { sessionsOrdersKeys } from '../keys';

export function useSessionsOrders() {
  return useQuery({
    queryKey: sessionsOrdersKeys.all,
    queryFn: sessionsOrdersService.getAll,
  });
}
