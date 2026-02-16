export const requestRelationshipsKeys = {
  all: ['request-relationships'] as const,
  lists: () => [...requestRelationshipsKeys.all, 'list'] as const,
  list: (limit: number, offset: number) =>
    [...requestRelationshipsKeys.lists(), { limit, offset }] as const,
  stats: () => [...requestRelationshipsKeys.all, 'stats'] as const,
};
