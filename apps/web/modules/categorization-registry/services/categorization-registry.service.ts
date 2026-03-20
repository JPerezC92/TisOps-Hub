import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  catRegCategorizationSchema,
  catRegCategorizationArraySchema,
} from '@repo/reports/frontend';
import type { CatRegCategorization } from '@repo/reports/frontend';

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
  getAll: async (): Promise<CatRegCategorization[]> => {
    const raw = await apiClient.get<unknown>('/categorization-registry');
    return parseJsendData(catRegCategorizationArraySchema, raw);
  },

  getById: async (id: number): Promise<CatRegCategorization> => {
    const raw = await apiClient.get<unknown>(`/categorization-registry/${id}`);
    return parseJsendData(catRegCategorizationSchema, raw);
  },

  create: async (data: CreateCategorizationDto): Promise<CatRegCategorization> => {
    const raw = await apiClient.post<unknown>(
      '/categorization-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return parseJsendData(catRegCategorizationSchema, raw);
  },

  update: async (id: number, data: UpdateCategorizationDto): Promise<CatRegCategorization> => {
    const raw = await apiClient.put<unknown>(`/categorization-registry/${id}`, data);
    return parseJsendData(catRegCategorizationSchema, raw);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`/categorization-registry/${id}`);
  },
};
