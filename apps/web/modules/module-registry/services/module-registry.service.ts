import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';

export interface Module {
  id: number;
  sourceValue: string;
  displayValue: string;
  application: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  getAll: async (): Promise<Module[]> => {
    const response = await apiClient.get<JSendSuccess<Module[]>>(
      '/module-registry'
    );
    return response.data;
  },

  getById: async (id: number): Promise<Module> => {
    const response = await apiClient.get<JSendSuccess<Module>>(
      `/module-registry/${id}`
    );
    return response.data;
  },

  create: async (data: CreateModuleDto): Promise<Module> => {
    const response = await apiClient.post<JSendSuccess<Module>>(
      '/module-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return response.data;
  },

  update: async (id: number, data: UpdateModuleDto): Promise<Module> => {
    const response = await apiClient.put<JSendSuccess<Module>>(
      `/module-registry/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<JSendSuccess<{ deleted: boolean }>>(
      `/module-registry/${id}`
    );
  },
};
