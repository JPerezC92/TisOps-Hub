import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  probGetAllResponseSchema,
  probUploadResultSchema,
  probDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  ProbGetAllResponse,
  ProbUploadResult,
  ProbDeleteResult,
} from '@repo/reports/frontend';

export const problemsService = {
  getAll: async (): Promise<ProbGetAllResponse> => {
    const raw = await apiClient.get<unknown>('/problems');
    return parseJsendData(probGetAllResponseSchema, raw);
  },

  upload: async (file: File): Promise<ProbUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/problems/upload', formData);
    return parseJsendData(probUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<ProbDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/problems');
    return parseJsendData(probDeleteResultSchema, raw);
  },
};
