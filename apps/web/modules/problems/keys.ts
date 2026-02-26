export const problemsKeys = {
  all: ['problems'] as const,
  lists: () => [...problemsKeys.all, 'list'] as const,
};
