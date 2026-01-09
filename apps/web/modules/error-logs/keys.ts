export const errorLogsKeys = {
  all: ['error-logs'] as const,
  list: (limit: number) => ['error-logs', 'list', limit] as const,
};
