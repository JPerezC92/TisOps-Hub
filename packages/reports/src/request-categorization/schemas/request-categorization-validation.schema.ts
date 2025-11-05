import { z } from 'zod';

export const insertRequestCategorizationSchema = z.object({
  category: z.string().min(1).max(255),
  technician: z.string().min(1).max(255),
  requestId: z.string().min(1).max(50),
  requestIdLink: z.string().url().optional(),
  createdTime: z.string().min(1).max(50),
  modulo: z.string().min(1).max(255),
  subject: z.string().min(1),
  problemId: z.string().min(1).max(100),
  linkedRequestId: z.string().min(1).max(50),
  linkedRequestIdLink: z.string().url().optional(),
});

export const updateRequestCategorizationSchema = z.object({
  category: z.string().min(1).max(255).optional(),
  technician: z.string().min(1).max(255).optional(),
  requestId: z.string().min(1).max(50).optional(),
  requestIdLink: z.string().url().optional(),
  createdTime: z.string().min(1).max(50).optional(),
  modulo: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).optional(),
  problemId: z.string().min(1).max(100).optional(),
  linkedRequestId: z.string().min(1).max(50).optional(),
  linkedRequestIdLink: z.string().url().optional(),
});

export type CreateRequestCategorizationDto = z.infer<typeof insertRequestCategorizationSchema>;
export type UpdateRequestCategorizationDto = z.infer<typeof updateRequestCategorizationSchema>;
