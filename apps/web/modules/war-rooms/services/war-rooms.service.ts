import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  warRoomGetAllResponseSchema,
  warRoomUploadResultSchema,
  warRoomDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  WarRoomGetAllResponse,
  WarRoomUploadResult,
  WarRoomDeleteResult,
} from '@repo/reports/frontend';

export const warRoomsService = {
  getAll: async (): Promise<WarRoomGetAllResponse> => {
    const raw = await apiClient.get<unknown>('/war-rooms');
    return parseJsendData(warRoomGetAllResponseSchema, raw);
  },

  upload: async (file: File): Promise<WarRoomUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/war-rooms/upload', formData);
    return parseJsendData(warRoomUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<WarRoomDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/war-rooms');
    return parseJsendData(warRoomDeleteResultSchema, raw);
  },
};
