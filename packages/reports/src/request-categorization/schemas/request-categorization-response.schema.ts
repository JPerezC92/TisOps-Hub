import { z } from 'zod';

export const requestIdEntrySchema = z.object({
  requestId: z.string(),
  requestIdLink: z.string().optional(),
});

export const reqCatWithInfoSchema = z.object({
  requestId: z.string(),
  category: z.string(),
  technician: z.string(),
  requestIdLink: z.string().optional(),
  createdTime: z.string(),
  modulo: z.string(),
  subject: z.string(),
  problemId: z.string(),
  linkedRequestId: z.string(),
  linkedRequestIdLink: z.string().optional(),
  additionalInformation: z.array(z.string()),
  tagCategorizacion: z.array(z.string()),
});

export const reqCatCategorySummarySchema = z.object({
  category: z.string(),
  count: z.number(),
});

export const reqCatUploadResultSchema = z.object({
  message: z.string(),
  recordsCreated: z.number(),
  recordsUpdated: z.number(),
  totalRecords: z.number(),
});

export const reqCatDeleteResultSchema = z.object({
  message: z.string(),
});

export const reqCatRequestIdsResponseSchema = z.object({
  requestIds: z.array(requestIdEntrySchema),
});

// Pre-composed array schemas (avoids cross-package type inference issues with z.array())
export const reqCatWithInfoArraySchema = z.array(reqCatWithInfoSchema);
export const reqCatCategorySummaryArraySchema = z.array(reqCatCategorySummarySchema);

export type ReqCatWithInfo = z.infer<typeof reqCatWithInfoSchema>;
export type ReqCatCategorySummary = z.infer<typeof reqCatCategorySummarySchema>;
export type ReqCatUploadResult = z.infer<typeof reqCatUploadResultSchema>;
export type ReqCatDeleteResult = z.infer<typeof reqCatDeleteResultSchema>;
export type RequestIdEntry = z.infer<typeof requestIdEntrySchema>;
export type ReqCatRequestIdsResponse = z.infer<typeof reqCatRequestIdsResponseSchema>;
