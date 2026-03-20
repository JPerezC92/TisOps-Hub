import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const taskSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(['low', 'medium', 'high']),
  completed: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const taskArraySchema = z.array(taskSchema);

export const taskDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

// Inferred types
export type TaskSchemaResponse = z.infer<typeof taskSchema>;
export type TaskDeleteResult = z.infer<typeof taskDeleteResultSchema>;
