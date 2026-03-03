import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  requestCategorizationWithInfoArraySchema,
  categorySummaryArraySchema,
  requestIdsByCategorizationResponseSchema,
  uploadResultSchema,
  deleteResultSchema,
} from '@repo/reports/frontend';
import type {
  RequestCategorizationWithInfo,
  CategorySummaryResponse,
  UploadResult,
  DeleteResult,
  RequestIdsByCategorization,
} from '@repo/reports/frontend';

export type {
  RequestCategorizationWithInfo,
  CategorySummaryResponse,
  UploadResult,
  DeleteResult,
  RequestIdsByCategorization,
};

export const requestCategorizationService = {
  getAll: async (): Promise<RequestCategorizationWithInfo[]> => {
    const raw = await apiClient.get<unknown>('/request-categorization');
    return parseJsendData(requestCategorizationWithInfoArraySchema, raw);
  },

  getSummary: async (): Promise<CategorySummaryResponse[]> => {
    const raw = await apiClient.get<unknown>('/request-categorization/summary');
    return parseJsendData(categorySummaryArraySchema, raw);
  },

  getRequestIdsByCategorization: async (
    linkedRequestId: string,
    categorizacion: string,
  ): Promise<RequestIdsByCategorization> => {
    const raw = await apiClient.get<unknown>(
      `/request-categorization/request-ids-by-categorization?linkedRequestId=${encodeURIComponent(linkedRequestId)}&categorizacion=${encodeURIComponent(categorizacion)}`,
    );
    return parseJsendData(requestIdsByCategorizationResponseSchema, raw);
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>(
      '/request-categorization/upload',
      formData,
    );
    return parseJsendData(uploadResultSchema, raw);
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const raw = await apiClient.delete<unknown>('/request-categorization');
    return parseJsendData(deleteResultSchema, raw);
  },
};
