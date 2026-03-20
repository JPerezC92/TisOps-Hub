import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import {
  moRepStatusSchema,
  moRepStatusArraySchema,
} from '@repo/reports/frontend';
import type { MoRepStatus } from '@repo/reports/frontend';

export interface CreateMonthlyReportStatusDto {
  rawStatus: string;
  displayStatus: string;
  isActive?: boolean;
}

export interface UpdateMonthlyReportStatusDto {
  rawStatus?: string;
  displayStatus?: string;
  isActive?: boolean;
}

export const monthlyReportStatusRegistryService = {
  getAll: async (): Promise<MoRepStatus[]> => {
    const raw = await apiClient.get<unknown>('/monthly-report-status-registry');
    return parseJsendData(moRepStatusArraySchema, raw);
  },

  getById: async (id: number): Promise<MoRepStatus> => {
    const raw = await apiClient.get<unknown>(`/monthly-report-status-registry/${id}`);
    return parseJsendData(moRepStatusSchema, raw);
  },

  create: async (data: CreateMonthlyReportStatusDto): Promise<MoRepStatus> => {
    const raw = await apiClient.post<unknown>(
      '/monthly-report-status-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return parseJsendData(moRepStatusSchema, raw);
  },

  update: async (id: number, data: UpdateMonthlyReportStatusDto): Promise<MoRepStatus> => {
    const raw = await apiClient.put<unknown>(`/monthly-report-status-registry/${id}`, data);
    return parseJsendData(moRepStatusSchema, raw);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<unknown>(`/monthly-report-status-registry/${id}`);
  },
};
