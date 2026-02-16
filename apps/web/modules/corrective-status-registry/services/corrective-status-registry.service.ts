import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';

export interface CorrectiveStatus {
  id: number;
  rawStatus: string;
  displayStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  getAll: async (): Promise<CorrectiveStatus[]> => {
    const response = await apiClient.get<JSendSuccess<CorrectiveStatus[]>>(
      '/corrective-status-registry'
    );
    return response.data;
  },

  getDisplayStatusOptions: async (): Promise<string[]> => {
    const response = await apiClient.get<JSendSuccess<string[]>>(
      '/corrective-status-registry/display-statuses'
    );
    return response.data;
  },

  getById: async (id: number): Promise<CorrectiveStatus> => {
    const response = await apiClient.get<JSendSuccess<CorrectiveStatus>>(
      `/corrective-status-registry/${id}`
    );
    return response.data;
  },

  create: async (data: CreateCorrectiveStatusDto): Promise<CorrectiveStatus> => {
    const response = await apiClient.post<JSendSuccess<CorrectiveStatus>>(
      '/corrective-status-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateCorrectiveStatusDto
  ): Promise<CorrectiveStatus> => {
    const response = await apiClient.put<JSendSuccess<CorrectiveStatus>>(
      `/corrective-status-registry/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<JSendSuccess<void>>(
      `/corrective-status-registry/${id}`
    );
  },
};
