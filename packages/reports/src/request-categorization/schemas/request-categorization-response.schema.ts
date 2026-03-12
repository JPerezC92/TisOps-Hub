import { z } from 'zod';

export const requestIdEntrySchema = z.object({
  requestId: z.string(),
  requestIdLink: z.string().optional(),
});

export const requestCategorizationWithInfoSchema = z.object({
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

export const uploadResultSchema = z.object({
  message: z.string(),
  recordsCreated: z.number(),
  recordsUpdated: z.number(),
  totalRecords: z.number(),
});

export const deleteResultSchema = z.object({
  message: z.string(),
});

export const requestIdsByCategorizationResponseSchema = z.object({
  requestIds: z.array(requestIdEntrySchema),
});

// Pre-composed array schemas (avoids cross-package type inference issues with z.array())
export const requestCategorizationWithInfoArraySchema = z.array(requestCategorizationWithInfoSchema);
export const reqCatCategorySummaryArraySchema = z.array(reqCatCategorySummarySchema);

export type RequestCategorizationWithInfo = z.infer<typeof requestCategorizationWithInfoSchema>;
export type CategorySummaryResponse = z.infer<typeof reqCatCategorySummarySchema>;
export type UploadResult = z.infer<typeof uploadResultSchema>;
export type DeleteResult = z.infer<typeof deleteResultSchema>;
export type RequestIdEntry = z.infer<typeof requestIdEntrySchema>;
export type RequestIdsByCategorization = z.infer<typeof requestIdsByCategorizationResponseSchema>;
