import { z } from 'zod';

export const insertRequestTagSchema = z.object({
  createdTime: z.string().min(1),
  requestId: z.string().min(1),
  informacionAdicional: z.string().min(1),
  modulo: z.string().min(1),
  problemId: z.string().min(1),
  linkedRequestId: z.string().min(1),
  jira: z.string().min(1),
  categorizacion: z.string().min(1),
  technician: z.string().min(1),
});

export const updateRequestTagSchema = z.object({
  createdTime: z.string().min(1).optional(),
  requestId: z.string().min(1).optional(),
  informacionAdicional: z.string().min(1).optional(),
  modulo: z.string().min(1).optional(),
  problemId: z.string().min(1).optional(),
  linkedRequestId: z.string().min(1).optional(),
  jira: z.string().min(1).optional(),
  categorizacion: z.string().min(1).optional(),
  technician: z.string().min(1).optional(),
});

export type CreateRequestTagDto = z.infer<typeof insertRequestTagSchema>;
export type UpdateRequestTagDto = z.infer<typeof updateRequestTagSchema>;
