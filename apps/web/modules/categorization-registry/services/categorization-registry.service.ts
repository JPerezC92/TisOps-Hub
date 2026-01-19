import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';

export interface Categorization {
  id: number;
  sourceValue: string;
  displayValue: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategorizationDto {
  sourceValue: string;
  displayValue: string;
  isActive?: boolean;
}

export interface UpdateCategorizationDto {
  sourceValue?: string;
  displayValue?: string;
  isActive?: boolean;
}

export const categorizationRegistryService = {
  getAll: async (): Promise<Categorization[]> => {
    const response = await apiClient.get<JSendSuccess<Categorization[]>>(
      '/categorization-registry'
    );
    return response.data;
  },

  getById: async (id: number): Promise<Categorization> => {
    const response = await apiClient.get<JSendSuccess<Categorization>>(
      `/categorization-registry/${id}`
    );
    return response.data;
  },

  create: async (data: CreateCategorizationDto): Promise<Categorization> => {
    const response = await apiClient.post<JSendSuccess<Categorization>>(
      '/categorization-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateCategorizationDto
  ): Promise<Categorization> => {
    const response = await apiClient.put<JSendSuccess<Categorization>>(
      `/categorization-registry/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<JSendSuccess<void>>(
      `/categorization-registry/${id}`
    );
  },
};
