export const correctiveStatusRegistryKeys = {
  all: ['corrective-status-registry'] as const,
  lists: () => [...correctiveStatusRegistryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...correctiveStatusRegistryKeys.lists(), filters] as const,
  details: () => [...correctiveStatusRegistryKeys.all, 'detail'] as const,
  detail: (id: number) => [...correctiveStatusRegistryKeys.details(), id] as const,
  displayStatusOptions: () =>
    [...correctiveStatusRegistryKeys.all, 'display-status-options'] as const,
};
