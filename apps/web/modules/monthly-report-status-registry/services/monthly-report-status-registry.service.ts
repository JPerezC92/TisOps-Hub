import { apiClient } from '@/shared/api/client';
import type { JSendSuccess } from '@repo/reports/common';

export interface MonthlyReportStatus {
  id: number;
  rawStatus: string;
  displayStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  getAll: async (): Promise<MonthlyReportStatus[]> => {
    const response = await apiClient.get<JSendSuccess<MonthlyReportStatus[]>>(
      '/monthly-report-status-registry'
    );
    return response.data;
  },

  getById: async (id: number): Promise<MonthlyReportStatus> => {
    const response = await apiClient.get<JSendSuccess<MonthlyReportStatus>>(
      `/monthly-report-status-registry/${id}`
    );
    return response.data;
  },

  create: async (data: CreateMonthlyReportStatusDto): Promise<MonthlyReportStatus> => {
    const response = await apiClient.post<JSendSuccess<MonthlyReportStatus>>(
      '/monthly-report-status-registry',
      { ...data, isActive: data.isActive ?? true }
    );
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateMonthlyReportStatusDto
  ): Promise<MonthlyReportStatus> => {
    const response = await apiClient.put<JSendSuccess<MonthlyReportStatus>>(
      `/monthly-report-status-registry/${id}`,
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete<JSendSuccess<void>>(
      `/monthly-report-status-registry/${id}`
    );
  },
};
