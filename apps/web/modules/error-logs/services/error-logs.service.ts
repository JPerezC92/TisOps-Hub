import { apiClient } from '@/shared/api/client';
import type { ErrorLogResponse } from '@repo/reports/frontend';
import type { JSendSuccess } from '@repo/reports/common';

// Service object
export const errorLogsService = {
  getAll: async (limit: number = 50): Promise<ErrorLogResponse> => {
    const response = await apiClient.get<JSendSuccess<ErrorLogResponse>>(
      `/error-logs?limit=${limit}`
    );
    return response.data;
  },
};
