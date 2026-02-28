export const sessionsOrdersKeys = {
  all: ['sessions-orders'] as const,
  lists: () => [...sessionsOrdersKeys.all, 'list'] as const,
};
