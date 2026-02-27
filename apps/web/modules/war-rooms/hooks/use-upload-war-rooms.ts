import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warRoomsService } from '../services/war-rooms.service';
import { warRoomsKeys } from '../keys';

export function useUploadWarRooms() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => warRoomsService.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warRoomsKeys.all });
    },
    onError: (error) => {
      console.error('Upload war rooms failed:', error);
    },
    retry: 0,
  });
}
