import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const moRepStatusSchema = z.object({
  id: z.number(),
  rawStatus: z.string(),
  displayStatus: z.string(),
  isActive: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const moRepStatusArraySchema = z.array(moRepStatusSchema);

export const moRepStatusDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

// Inferred types
export type MoRepStatus = z.infer<typeof moRepStatusSchema>;
export type MoRepStatusDeleteResult = z.infer<typeof moRepStatusDeleteResultSchema>;
