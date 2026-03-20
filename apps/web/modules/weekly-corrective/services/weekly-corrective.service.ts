import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  wkCorrGetAllResponseSchema,
  wkCorrUploadResultSchema,
  wkCorrDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  WkCorrGetAllResponse,
  WkCorrUploadResult,
  WkCorrDeleteResult,
} from '@repo/reports/frontend';

export const weeklyCorrectiveService = {
  getAll: async (): Promise<WkCorrGetAllResponse> => {
    const raw = await apiClient.get<unknown>('/weekly-corrective');
    return parseJsendData(wkCorrGetAllResponseSchema, raw);
  },

  upload: async (file: File): Promise<WkCorrUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/weekly-corrective/upload', formData);
    return parseJsendData(wkCorrUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<WkCorrDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/weekly-corrective');
    return parseJsendData(wkCorrDeleteResultSchema, raw);
  },
};
