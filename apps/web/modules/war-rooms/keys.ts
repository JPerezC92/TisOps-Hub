export const warRoomsKeys = {
  all: ['war-rooms'] as const,
  lists: () => [...warRoomsKeys.all, 'list'] as const,
};
