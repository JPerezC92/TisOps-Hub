import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  reqCatWithInfoArraySchema,
  reqCatCategorySummaryArraySchema,
  reqCatRequestIdsResponseSchema,
  reqCatUploadResultSchema,
  reqCatDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  ReqCatWithInfo,
  ReqCatCategorySummary,
  ReqCatUploadResult,
  ReqCatDeleteResult,
  ReqCatRequestIdsResponse,
} from '@repo/reports/frontend';

export type {
  ReqCatWithInfo,
  ReqCatCategorySummary,
  ReqCatUploadResult,
  ReqCatDeleteResult,
  ReqCatRequestIdsResponse,
};

export const requestCategorizationService = {
  getAll: async (): Promise<ReqCatWithInfo[]> => {
    const raw = await apiClient.get<unknown>('/request-categorization');
    return parseJsendData(reqCatWithInfoArraySchema, raw);
  },

  getSummary: async (): Promise<ReqCatCategorySummary[]> => {
    const raw = await apiClient.get<unknown>('/request-categorization/summary');
    return parseJsendData(reqCatCategorySummaryArraySchema, raw);
  },

  getRequestIdsByCategorization: async (
    linkedRequestId: string,
    categorizacion: string,
  ): Promise<ReqCatRequestIdsResponse> => {
    const raw = await apiClient.get<unknown>(
      `/request-categorization/request-ids-by-categorization?linkedRequestId=${encodeURIComponent(linkedRequestId)}&categorizacion=${encodeURIComponent(categorizacion)}`,
    );
    return parseJsendData(reqCatRequestIdsResponseSchema, raw);
  },

  upload: async (file: File): Promise<ReqCatUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>(
      '/request-categorization/upload',
      formData,
    );
    return parseJsendData(reqCatUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<ReqCatDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/request-categorization');
    return parseJsendData(reqCatDeleteResultSchema, raw);
  },
};
