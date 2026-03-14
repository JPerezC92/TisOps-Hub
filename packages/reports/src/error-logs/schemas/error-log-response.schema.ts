import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const errorLogSchema = z.object({
  id: z.number().optional(),
  timestamp: isoDateString,
  errorType: z.string(),
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  endpoint: z.string().optional(),
  method: z.string().optional(),
  userId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const errorLogListResponseSchema = z.object({
  logs: z.array(errorLogSchema),
  total: z.number(),
});

// Inferred types
export type ErrorLogSchemaResponse = z.infer<typeof errorLogSchema>;
export type ErrorLogListResponse = z.infer<typeof errorLogListResponseSchema>;
