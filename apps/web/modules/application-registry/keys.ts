export const applicationRegistryKeys = {
  all: ['application-registry'] as const,
  withPatterns: () => [...applicationRegistryKeys.all, 'with-patterns'] as const,
};
