import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  correctiveStatusSchema,
  correctiveStatusArraySchema,
  correctiveStatusDisplayStatusesSchema,
} from '@repo/reports/frontend';
import type { CorrectiveStatusResponse } from '@repo/reports/frontend';

export interface CreateCorrectiveStatusDto {
  rawStatus: string;
  displayStatus: string;
  isActive?: boolean;
}

export interface UpdateCorrectiveStatusDto {
  rawStatus?: string;
  displayStatus?: string;
  isActive?: boolean;
}

export const correctiveStatusRegistryService = {
  getAll: async (): Promise<CorrectiveStatusResponse[]> => {
    const raw = await apiClient.get<unknown>('/corrective-status-registry');
    return parseJsendData(correctiveStatusArraySchema, raw);
  },

  getDisplayStatusOptions: async (): Promise<string[]> => {
    const raw = await apiClient.get<unknown>('/corrective-status-registry/display-statuses');
    return parseJsendData(correctiveStatusDisplayStatusesSchema, raw);
  },

  getById: async (id: number): Promise<CorrectiveStatusResponse> => {
    const raw = await apiClient.get<unknown>(`/corrective-status-registry/${id}`);
    return parseJsendData(correctiveStatusSchema, raw);
  },

  create: async (data: CreateCorrectiveStatusDto): Promise<CorrectiveStatusResponse> => {
    const raw = await apiClient.post<unknown>(
      '/corrective-status-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return parseJsendData(correctiveStatusSchema, raw);
  },

  update: async (id: number, data: UpdateCorrectiveStatusDto): Promise<CorrectiveStatusResponse> => {
    const raw = await apiClient.put<unknown>(`/corrective-status-registry/${id}`, data);
    return parseJsendData(correctiveStatusSchema, raw);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`/corrective-status-registry/${id}`);
  },
};
