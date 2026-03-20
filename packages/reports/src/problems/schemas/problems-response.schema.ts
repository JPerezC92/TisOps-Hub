import { z } from 'zod';

export const probProblemSchema = z.object({
  requestId: z.number(),
  requestIdLink: z.string().nullable(),
  serviceCategory: z.string(),
  requestStatus: z.string(),
  subject: z.string(),
  subjectLink: z.string().nullable(),
  createdTime: z.string(),
  aplicativos: z.string(),
  createdBy: z.string(),
  technician: z.string(),
  planesDeAccion: z.string(),
  observaciones: z.string(),
  dueByTime: z.string(),
});

export const probProblemArraySchema = z.array(probProblemSchema);

export const probGetAllResponseSchema = z.object({
  data: probProblemArraySchema,
  total: z.number(),
});

export const probUploadResultSchema = z.object({
  message: z.string(),
  imported: z.number(),
  total: z.number(),
});

export const probDeleteResultSchema = z.object({
  message: z.string(),
  deleted: z.number(),
});

export type ProbGetAllResponse = z.infer<typeof probGetAllResponseSchema>;
export type ProbUploadResult = z.infer<typeof probUploadResultSchema>;
export type ProbDeleteResult = z.infer<typeof probDeleteResultSchema>;
