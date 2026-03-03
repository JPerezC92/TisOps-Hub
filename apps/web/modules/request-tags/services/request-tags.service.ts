import { apiClient } from '@/shared/api/client';
import type { RequestTag } from '@repo/reports/frontend';
import {
  byAdditionalInfoResponseSchema,
  missingIdsResponseSchema,
} from '@repo/reports/frontend';
import type {
  ByAdditionalInfoResponse,
  MissingIdsResponse,
} from '@repo/reports/frontend';
import type { JSendSuccess } from '@repo/reports/common';
import { parseJsendData } from '@repo/reports/common';

export interface GetAllResponse {
  tags: RequestTag[];
  total: number;
}

export interface UploadResponse {
  imported: number;
  skipped: number;
  total: number;
}

export interface DeleteResponse {
  deleted: number;
}

export const requestTagsService = {
  getAll: async (): Promise<GetAllResponse> => {
    const response = await apiClient.get<JSendSuccess<GetAllResponse>>('/request-tags');
    return response.data;
  },

  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postForm<JSendSuccess<UploadResponse>>('/request-tags/upload', formData);
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResponse> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResponse>>('/request-tags');
    return response.data;
  },

  getByAdditionalInfo: async (
    info: string,
    linkedRequestId: string,
  ): Promise<ByAdditionalInfoResponse> => {
    const raw = await apiClient.get<unknown>(
      `/request-tags/by-additional-info?info=${encodeURIComponent(info)}&linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
    );
    return parseJsendData(byAdditionalInfoResponseSchema, raw);
  },

  getMissingIds: async (
    linkedRequestId: string,
  ): Promise<MissingIdsResponse> => {
    const raw = await apiClient.get<unknown>(
      `/request-tags/missing-ids?linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
    );
    return parseJsendData(missingIdsResponseSchema, raw);
  },
};
