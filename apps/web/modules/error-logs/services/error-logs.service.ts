import { apiClient } from '@/shared/api/client';
import { parseJsendData } from '@repo/reports/common';
import { errorLogListResponseSchema } from '@repo/reports/frontend';
import type { ErrorLogListResponse } from '@repo/reports/frontend';

export const errorLogsService = {
  getAll: async (limit: number = 50): Promise<ErrorLogListResponse> => {
    const raw = await apiClient.get<unknown>(`/error-logs?limit=${limit}`);
    return parseJsendData(errorLogListResponseSchema, raw);
  },
};
