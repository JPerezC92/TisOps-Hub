import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  pcReqGetAllResponseSchema,
  pcReqStatsResponseSchema,
  pcReqUploadResultSchema,
  pcReqDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  PcReqGetAllResponse,
  PcReqStatsResponse,
  PcReqUploadResult,
  PcReqDeleteResult,
} from '@repo/reports/frontend';

export const requestRelationshipsService = {
  getAll: async (limit = 100, offset = 0): Promise<PcReqGetAllResponse> => {
    const raw = await apiClient.get<unknown>(
      `/parent-child-requests?limit=${limit}&offset=${offset}`
    );
    return parseJsendData(pcReqGetAllResponseSchema, raw);
  },

  getStats: async (): Promise<PcReqStatsResponse> => {
    const raw = await apiClient.get<unknown>('/parent-child-requests/stats');
    return parseJsendData(pcReqStatsResponseSchema, raw);
  },

  upload: async (file: File): Promise<PcReqUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>(
      '/parent-child-requests/upload',
      formData
    );
    return parseJsendData(pcReqUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<PcReqDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/parent-child-requests');
    return parseJsendData(pcReqDeleteResultSchema, raw);
  },
};
