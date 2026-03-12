import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  appRegistryWithPatternsArraySchema,
  appRegistryApplicationSchema,
  appRegistryPatternSchema,
  appRegistryDeleteResultSchema,
} from '@repo/reports/frontend';
import type {
  AppRegistryWithPatterns,
  AppRegistryApplicationResponse,
  AppRegistryPatternResponse,
  AppRegistryDeleteResult,
} from '@repo/reports/frontend';

export type { AppRegistryWithPatterns, AppRegistryApplicationResponse, AppRegistryPatternResponse };

export interface CreateApplicationData {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateApplicationData {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePatternData {
  pattern: string;
  priority: number;
}

export const applicationRegistryService = {
  getAllWithPatterns: async (): Promise<AppRegistryWithPatterns[]> => {
    const raw = await apiClient.get<unknown>('/application-registry/with-patterns');
    return parseJsendData(appRegistryWithPatternsArraySchema, raw);
  },

  create: async (data: CreateApplicationData): Promise<AppRegistryApplicationResponse> => {
    const raw = await apiClient.post<unknown>('/application-registry', {
      ...data,
      isActive: true,
    });
    return parseJsendData(appRegistryApplicationSchema, raw);
  },

  update: async (id: number, data: UpdateApplicationData): Promise<AppRegistryApplicationResponse> => {
    const raw = await apiClient.put<unknown>(`/application-registry/${id}`, data);
    return parseJsendData(appRegistryApplicationSchema, raw);
  },

  delete: async (id: number): Promise<AppRegistryDeleteResult> => {
    const raw = await apiClient.delete<unknown>(`/application-registry/${id}`);
    return parseJsendData(appRegistryDeleteResultSchema, raw);
  },

  createPattern: async (appId: number, data: CreatePatternData): Promise<AppRegistryPatternResponse> => {
    const raw = await apiClient.post<unknown>(`/application-registry/${appId}/patterns`, {
      ...data,
      matchType: 'contains',
      isActive: true,
    });
    return parseJsendData(appRegistryPatternSchema, raw);
  },

  deletePattern: async (patternId: number): Promise<AppRegistryDeleteResult> => {
    const raw = await apiClient.delete<unknown>(`/application-registry/patterns/${patternId}`);
    return parseJsendData(appRegistryDeleteResultSchema, raw);
  },
};
