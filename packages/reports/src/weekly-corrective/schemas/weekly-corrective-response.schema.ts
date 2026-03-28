import { z } from 'zod';

export const wkCorrWeeklyCorrectiveSchema = z.object({
  requestId: z.number(),
  requestIdLink: z.string().nullable(),
  technician: z.string(),
  aplicativos: z.string(),
  categorizacion: z.string(),
  createdTime: z.string(),
  requestStatus: z.string(),
  modulo: z.string(),
  subject: z.string(),
  priority: z.string(),
  eta: z.string(),
  rca: z.string(),
});

export const wkCorrGetAllResponseSchema = z.object({
  data: z.array(wkCorrWeeklyCorrectiveSchema),
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

export const wkCorrL3TicketsByStatusRowSchema = z.object({
  application: z.string(),
  statusCounts: z.record(z.string(), z.number()),
  total: z.number(),
});

export const wkCorrL3TicketsByStatusResponseSchema = z.object({
  data: z.array(wkCorrL3TicketsByStatusRowSchema),
  statusColumns: z.array(z.string()),
  monthName: z.string(),
  totalL3Tickets: z.number(),
});

// Inferred types
export type WkCorrWeeklyCorrective = z.infer<typeof wkCorrWeeklyCorrectiveSchema>;
export type WkCorrGetAllResponse = z.infer<typeof wkCorrGetAllResponseSchema>;
export type WkCorrUploadResult = z.infer<typeof wkCorrUploadResultSchema>;
export type WkCorrDeleteResult = z.infer<typeof wkCorrDeleteResultSchema>;
export type WkCorrL3TicketsByStatusResponse = z.infer<typeof wkCorrL3TicketsByStatusResponseSchema>;
