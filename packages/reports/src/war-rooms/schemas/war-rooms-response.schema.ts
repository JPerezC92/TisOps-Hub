import { z } from 'zod';

export const warRoomGetAllResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
});

export const warRoomUploadResultSchema = z.object({
  message: z.string(),
  imported: z.number(),
  total: z.number(),
});

export const warRoomDeleteResultSchema = z.object({
  message: z.string(),
  deleted: z.number(),
});

export const warRoomAnalyticsResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
});

// Inferred types
export type WarRoomGetAllResponse = z.infer<typeof warRoomGetAllResponseSchema>;
export type WarRoomUploadResult = z.infer<typeof warRoomUploadResultSchema>;
export type WarRoomDeleteResult = z.infer<typeof warRoomDeleteResultSchema>;
export type WarRoomAnalyticsResponse = z.infer<typeof warRoomAnalyticsResponseSchema>;
