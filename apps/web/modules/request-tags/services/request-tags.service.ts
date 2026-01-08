import { apiClient } from '@/shared/api/client';
import type { RequestTag } from '@repo/reports/frontend';
import type { JSendSuccess } from '@repo/reports/common';

export interface GetAllResponse {
  tags: RequestTag[];
  total: number;
}

export interface UploadResponse {
  imported: number;
  skipped: number;
  total: number;
}

export interface DeleteResponse {
  deleted: number;
}

export const requestTagsService = {
  getAll: async (): Promise<GetAllResponse> => {
    const response = await apiClient.get<JSendSuccess<GetAllResponse>>('/request-tags');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postForm<JSendSuccess<UploadResponse>>('/request-tags/upload', formData);
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResponse> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResponse>>('/request-tags');
    return response.data;
  },
};
