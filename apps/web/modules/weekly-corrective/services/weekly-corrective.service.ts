import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';
import type { WeeklyCorrective } from '@repo/reports/frontend';

export type { WeeklyCorrective };

export interface UploadResult {
  message: string;
  imported: number;
  total: number;
}

export interface DeleteResult {
  message: string;
  deleted: number;
}

export const weeklyCorrectiveService = {
  getAll: async (): Promise<{ data: WeeklyCorrective[]; total: number }> => {
    const response = await apiClient.get<
      JSendSuccess<{ data: WeeklyCorrective[]; total: number }>
    >('/weekly-corrective');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/weekly-corrective/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/weekly-corrective'
    );
    return response.data;
  },
};
