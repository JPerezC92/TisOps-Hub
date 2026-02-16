import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';

export interface ParentChildRequest {
  id: number;
  requestId: string;
  linkedRequestId: string;
  requestIdLink: string | null;
  linkedRequestIdLink: string | null;
}

export interface RelationshipsStats {
  totalRecords: number;
  uniqueParents: number;
  topParents: Array<{
    parentId: string;
    childCount: number;
    link: string | null;
  }>;
}

export interface UploadResult {
  message: string;
  imported: number;
  skipped: number;
  total: number;
}

export interface DeleteResult {
  deleted: boolean;
  message: string;
}

export const requestRelationshipsService = {
  getAll: async (
    limit = 100,
    offset = 0
  ): Promise<{ data: ParentChildRequest[]; total: number }> => {
    const response = await apiClient.get<
      JSendSuccess<{ data: ParentChildRequest[]; total: number }>
    >(`/parent-child-requests?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  getStats: async (): Promise<RelationshipsStats> => {
    const response = await apiClient.get<JSendSuccess<RelationshipsStats>>(
      '/parent-child-requests/stats'
    );
    return response.data;
  },

  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.postForm<JSendSuccess<UploadResult>>(
      '/parent-child-requests/upload',
      formData
    );
    return response.data;
  },

  deleteAll: async (): Promise<DeleteResult> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResult>>(
      '/parent-child-requests'
    );
    return response.data;
  },
};
