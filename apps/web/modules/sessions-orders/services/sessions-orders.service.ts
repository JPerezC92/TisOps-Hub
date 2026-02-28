import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';
import type { SessionsOrder, SessionsOrdersRelease } from '@repo/reports/frontend';

export type { SessionsOrder, SessionsOrdersRelease };

export interface GetAllResult {
  data: SessionsOrder[];
  releases: SessionsOrdersRelease[];
  total: number;
  totalReleases: number;
}

export interface UploadResult {
  message: string;
  importedMain: number;
  importedReleases: number;
  totalMain: number;
  totalReleases: number;
}

export interface DeleteResult {
  message: string;
  deletedMain: number;
  deletedReleases: number;
}

export const sessionsOrdersService = {
  getAll: async (): Promise<GetAllResult> => {
    const response = await apiClient.get<JSendSuccess<GetAllResult>>(
      '/sessions-orders'
    );
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/sessions-orders/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/sessions-orders'
    );
    return response.data;
  },
};
