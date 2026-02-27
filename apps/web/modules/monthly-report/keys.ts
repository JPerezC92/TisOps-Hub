export const monthlyReportKeys = {
  all: ['monthly-report'] as const,
  lists: () => [...monthlyReportKeys.all, 'list'] as const,
};
