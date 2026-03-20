import { z } from 'zod';

export const wkCorrGetAllResponseSchema = z.object({
  data: z.array(z.any()),
  total: z.number(),
});

export const wkCorrUploadResultSchema = z.object({
  message: z.string(),
  imported: z.number(),
  total: z.number(),
});

export const wkCorrDeleteResultSchema = z.object({
  message: z.string(),
  deleted: z.number(),
});

export const wkCorrL3TicketsByStatusResponseSchema = z.any();

// Inferred types
export type WkCorrGetAllResponse = z.infer<typeof wkCorrGetAllResponseSchema>;
export type WkCorrUploadResult = z.infer<typeof wkCorrUploadResultSchema>;
export type WkCorrDeleteResult = z.infer<typeof wkCorrDeleteResultSchema>;
