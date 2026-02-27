import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';
import type { WarRoom } from '@repo/reports/frontend';

export type { WarRoom };

export interface UploadResult {
  message: string;
  imported: number;
  total: number;
}

export interface DeleteResult {
  message: string;
  deleted: number;
}

export const warRoomsService = {
  getAll: async (): Promise<{ data: WarRoom[]; total: number }> => {
    const response = await apiClient.get<
      JSendSuccess<{ data: WarRoom[]; total: number }>
    >('/war-rooms');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/war-rooms/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/war-rooms'
    );
    return response.data;
  },
};
