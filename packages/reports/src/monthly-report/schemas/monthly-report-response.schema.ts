import { z } from 'zod';

export const moRepGetAllResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
});

export const moRepUploadResultSchema = z.object({
  message: z.string(),
  imported: z.number(),
  total: z.number(),
  merged: z.number(),
  unique: z.number(),
});

export const moRepDeleteResultSchema = z.object({
  message: z.string(),
  deleted: z.number(),
});

// Inferred types
export type MoRepGetAllResponse = z.infer<typeof moRepGetAllResponseSchema>;
export type MoRepUploadResult = z.infer<typeof moRepUploadResultSchema>;
export type MoRepDeleteResult = z.infer<typeof moRepDeleteResultSchema>;
