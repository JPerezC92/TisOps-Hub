import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';
import type { Problem } from '@repo/reports/frontend';

export type { Problem };

export interface UploadResult {
  message: string;
  imported: number;
  total: number;
}

export interface DeleteResult {
  message: string;
  deleted: number;
}

export const problemsService = {
  getAll: async (): Promise<{ data: Problem[]; total: number }> => {
    const response = await apiClient.get<
      JSendSuccess<{ data: Problem[]; total: number }>
    >('/problems');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/problems/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/problems'
    );
    return response.data;
  },
};
