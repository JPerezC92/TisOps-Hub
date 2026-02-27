import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';
import type { MonthlyReport } from '@repo/reports/frontend';

export type { MonthlyReport };

export interface UploadResult {
  message: string;
  imported: number;
  total: number;
  merged: number;
  unique: number;
  skipped?: number;
}

export interface DeleteResult {
  message: string;
  deleted: number;
}

export const monthlyReportService = {
  getAll: async (): Promise<{ data: MonthlyReport[]; total: number }> => {
    const response = await apiClient.get<
      JSendSuccess<{ data: MonthlyReport[]; total: number }>
    >('/monthly-report');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/monthly-report/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/monthly-report'
    );
    return response.data;
  },
};
