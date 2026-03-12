import { z } from 'zod';
import { requestIdEntrySchema } from '../../request-categorization/schemas/request-categorization-response.schema';

export const requestTagSchema = z.object({
  requestId: z.string(),
  createdTime: z.string(),
  informacionAdicional: z.string(),
  modulo: z.string(),
  problemId: z.string(),
  linkedRequestId: z.string(),
  jira: z.string(),
  categorizacion: z.string(),
  technician: z.string(),
});

export const requestTagListResponseSchema = z.object({
  tags: z.array(requestTagSchema),
  total: z.number(),
});

export const requestTagUploadResultSchema = z.object({
  imported: z.number(),
  skipped: z.number(),
  total: z.number(),
});

export const requestTagDeleteResultSchema = z.object({
  deleted: z.number(),
});

export const requestTagByAdditionalInfoResponseSchema = z.object({
  requestIds: z.array(requestIdEntrySchema),
});

export const requestTagMissingIdsResponseSchema = z.object({
  missingIds: z.array(requestIdEntrySchema),
});

// Inferred types
export type RequestTagListResponse = z.infer<typeof requestTagListResponseSchema>;
export type RequestTagUploadResult = z.infer<typeof requestTagUploadResultSchema>;
export type RequestTagDeleteResult = z.infer<typeof requestTagDeleteResultSchema>;
export type RequestTagByAdditionalInfoResponse = z.infer<typeof requestTagByAdditionalInfoResponseSchema>;
export type RequestTagMissingIdsResponse = z.infer<typeof requestTagMissingIdsResponseSchema>;
