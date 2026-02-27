export const weeklyCorrectiveKeys = {
  all: ['weekly-corrective'] as const,
  lists: () => [...weeklyCorrectiveKeys.all, 'list'] as const,
};
