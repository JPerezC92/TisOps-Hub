import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const correctiveStatusSchema = z.object({
  id: z.number(),
  rawStatus: z.string(),
  displayStatus: z.string(),
  isActive: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const correctiveStatusArraySchema = z.array(correctiveStatusSchema);

export const correctiveStatusDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

// Inferred types
export type CorrectiveStatusResponse = z.infer<typeof correctiveStatusSchema>;
export type CorrectiveStatusDeleteResult = z.infer<
  typeof correctiveStatusDeleteResultSchema
>;
