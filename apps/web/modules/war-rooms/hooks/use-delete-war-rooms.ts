import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warRoomsService } from '../services/war-rooms.service';
import { warRoomsKeys } from '../keys';

export function useDeleteWarRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => warRoomsService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warRoomsKeys.all });
    },
    onError: (error) => {
      console.error('Delete all war rooms failed:', error);
    },
    retry: 0,
  });
}
