import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  moRepGetAllResponseSchema,
  moRepUploadResultSchema,
  moRepDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  MoRepGetAllResponse,
  MoRepUploadResult,
  MoRepDeleteResult,
} from '@repo/reports/frontend';

export const monthlyReportService = {
  getAll: async (): Promise<MoRepGetAllResponse> => {
    const raw = await apiClient.get<unknown>('/monthly-report');
    return parseJsendData(moRepGetAllResponseSchema, raw);
  },

  upload: async (file: File): Promise<MoRepUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/monthly-report/upload', formData);
    return parseJsendData(moRepUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<MoRepDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/monthly-report');
    return parseJsendData(moRepDeleteResultSchema, raw);
  },
};
