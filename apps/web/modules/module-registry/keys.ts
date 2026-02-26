export const moduleRegistryKeys = {
  all: ['module-registry'] as const,
  lists: () => [...moduleRegistryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...moduleRegistryKeys.lists(), filters] as const,
  details: () => [...moduleRegistryKeys.all, 'detail'] as const,
  detail: (id: number) => [...moduleRegistryKeys.details(), id] as const,
};
