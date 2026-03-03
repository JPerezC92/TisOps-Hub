import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  applicationWithPatternsArraySchema,
  applicationSchema,
  applicationPatternSchema,
  appRegistryDeleteMessageSchema,
} from '@repo/reports/frontend';
import type {
  AppRegistryWithPatterns,
  ApplicationResponse,
  ApplicationPatternResponse,
  AppRegistryDeleteMessage,
} from '@repo/reports/frontend';

export type { AppRegistryWithPatterns, ApplicationResponse, ApplicationPatternResponse };

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
    return parseJsendData(applicationWithPatternsArraySchema, raw);
  },

  create: async (data: CreateApplicationData): Promise<ApplicationResponse> => {
    const raw = await apiClient.post<unknown>('/application-registry', {
      ...data,
      isActive: true,
    });
    return parseJsendData(applicationSchema, raw);
  },

  update: async (id: number, data: UpdateApplicationData): Promise<ApplicationResponse> => {
    const raw = await apiClient.put<unknown>(`/application-registry/${id}`, data);
    return parseJsendData(applicationSchema, raw);
  },

  delete: async (id: number): Promise<AppRegistryDeleteMessage> => {
    const raw = await apiClient.delete<unknown>(`/application-registry/${id}`);
    return parseJsendData(appRegistryDeleteMessageSchema, raw);
  },

  createPattern: async (appId: number, data: CreatePatternData): Promise<ApplicationPatternResponse> => {
    const raw = await apiClient.post<unknown>(`/application-registry/${appId}/patterns`, {
      ...data,
      matchType: 'contains',
      isActive: true,
    });
    return parseJsendData(applicationPatternSchema, raw);
  },

  deletePattern: async (patternId: number): Promise<AppRegistryDeleteMessage> => {
    const raw = await apiClient.delete<unknown>(`/application-registry/patterns/${patternId}`);
    return parseJsendData(appRegistryDeleteMessageSchema, raw);
  },
};
