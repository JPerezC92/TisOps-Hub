import { z } from 'zod';

export const pcReqGetAllResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
});

export const pcReqStatsResponseSchema = z.object({
  totalRecords: z.number(),
  uniqueParents: z.number(),
  topParents: z.array(z.object({
    parentId: z.string(),
    childCount: z.number(),
    link: z.string().nullable(),
  })),
});

export const pcReqUploadResultSchema = z.object({
  message: z.string(),
  imported: z.number(),
  skipped: z.number(),
  total: z.number(),
});

export const pcReqDeleteResultSchema = z.object({
  deleted: z.boolean(),
  message: z.string(),
});

// Inferred types
export type PcReqGetAllResponse = z.infer<typeof pcReqGetAllResponseSchema>;
export type PcReqStatsResponse = z.infer<typeof pcReqStatsResponseSchema>;
export type PcReqUploadResult = z.infer<typeof pcReqUploadResultSchema>;
export type PcReqDeleteResult = z.infer<typeof pcReqDeleteResultSchema>;
