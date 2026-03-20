import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  modRegModuleSchema,
  modRegModuleArraySchema,
  modRegDeleteResultSchema,
} from '@repo/reports/frontend';
import type { ModRegModule } from '@repo/reports/frontend';

export interface CreateModuleDto {
  sourceValue: string;
  displayValue: string;
  application: string;
  isActive?: boolean;
}

export interface UpdateModuleDto {
  sourceValue?: string;
  displayValue?: string;
  application?: string;
  isActive?: boolean;
}

export const APPLICATIONS = ['CD', 'FFVV', 'SB', 'UNETE'] as const;

export const APPLICATION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CD: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/40' },
  FFVV: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/40' },
  SB: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/40' },
  UNETE: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/40' },
};

export const moduleRegistryService = {
  getAll: async (): Promise<ModRegModule[]> => {
    const raw = await apiClient.get<unknown>('/module-registry');
    return parseJsendData(modRegModuleArraySchema, raw);
  },

  getById: async (id: number): Promise<ModRegModule> => {
    const raw = await apiClient.get<unknown>(`/module-registry/${id}`);
    return parseJsendData(modRegModuleSchema, raw);
  },

  create: async (data: CreateModuleDto): Promise<ModRegModule> => {
    const raw = await apiClient.post<unknown>(
      '/module-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return parseJsendData(modRegModuleSchema, raw);
  },

  update: async (id: number, data: UpdateModuleDto): Promise<ModRegModule> => {
    const raw = await apiClient.put<unknown>(`/module-registry/${id}`, data);
    return parseJsendData(modRegModuleSchema, raw);
  },

  delete: async (id: number): Promise<void> => {
    const raw = await apiClient.delete<unknown>(`/module-registry/${id}`);
    parseJsendData(modRegDeleteResultSchema, raw);
  },
};
