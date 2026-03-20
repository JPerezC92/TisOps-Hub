import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  sessOrdGetAllResponseSchema,
  sessOrdUploadResultSchema,
  sessOrdDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  SessOrdGetAllResponse,
  SessOrdUploadResult,
  SessOrdDeleteResult,
} from '@repo/reports/frontend';

export const sessionsOrdersService = {
  getAll: async (): Promise<SessOrdGetAllResponse> => {
    const raw = await apiClient.get<unknown>('/sessions-orders');
    return parseJsendData(sessOrdGetAllResponseSchema, raw);
  },

  upload: async (file: File): Promise<SessOrdUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/sessions-orders/upload', formData);
    return parseJsendData(sessOrdUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<SessOrdDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/sessions-orders');
    return parseJsendData(sessOrdDeleteResultSchema, raw);
  },
};
