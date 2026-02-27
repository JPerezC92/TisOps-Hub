import { useQuery } from '@tanstack/react-query';
import { warRoomsService } from '../services/war-rooms.service';
import { warRoomsKeys } from '../keys';

export function useWarRooms() {
  return useQuery({
    queryKey: warRoomsKeys.all,
    queryFn: warRoomsService.getAll,
  });
}
