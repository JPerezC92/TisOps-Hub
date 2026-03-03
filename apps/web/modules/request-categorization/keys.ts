export const requestCategorizationKeys = {
  all: ['request-categorization'] as const,
  summary: () => [...requestCategorizationKeys.all, 'summary'] as const,
};
