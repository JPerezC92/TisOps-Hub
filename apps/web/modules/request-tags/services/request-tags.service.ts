import { apiClient } from '@/shared/api/client';
import {
  requestTagListResponseSchema,
  requestTagUploadResultSchema,
  requestTagDeleteResultSchema,
  requestTagByAdditionalInfoResponseSchema,
  requestTagMissingIdsResponseSchema,
} from '@repo/reports/frontend';
import type {
  RequestTagListResponse,
  RequestTagUploadResult,
  RequestTagDeleteResult,
  RequestTagByAdditionalInfoResponse,
  RequestTagMissingIdsResponse,
} from '@repo/reports/frontend';
import { parseJsendData } from '@repo/reports/common';

export type { RequestTagListResponse, RequestTagUploadResult, RequestTagDeleteResult };

export const requestTagsService = {
  getAll: async (): Promise<RequestTagListResponse> => {
    const raw = await apiClient.get<unknown>('/request-tags');
    return parseJsendData(requestTagListResponseSchema, raw);
  },

  upload: async (file: File): Promise<RequestTagUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const raw = await apiClient.postForm<unknown>('/request-tags/upload', formData);
    return parseJsendData(requestTagUploadResultSchema, raw);
  },

  deleteAll: async (): Promise<RequestTagDeleteResult> => {
    const raw = await apiClient.delete<unknown>('/request-tags');
    return parseJsendData(requestTagDeleteResultSchema, raw);
  },

  getByAdditionalInfo: async (
    info: string,
    linkedRequestId: string,
  ): Promise<RequestTagByAdditionalInfoResponse> => {
    const raw = await apiClient.get<unknown>(
      `/request-tags/by-additional-info?info=${encodeURIComponent(info)}&linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
    );
    return parseJsendData(requestTagByAdditionalInfoResponseSchema, raw);
  },

  getMissingIds: async (
    linkedRequestId: string,
  ): Promise<RequestTagMissingIdsResponse> => {
    const raw = await apiClient.get<unknown>(
      `/request-tags/missing-ids?linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
    );
    return parseJsendData(requestTagMissingIdsResponseSchema, raw);
  },
};
