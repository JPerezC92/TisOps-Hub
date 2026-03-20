import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const modRegModuleSchema = z.object({
  id: z.number(),
  sourceValue: z.string(),
  displayValue: z.string(),
  application: z.string(),
  isActive: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const modRegModuleArraySchema = z.array(modRegModuleSchema);

export const modRegDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

// Inferred types
export type ModRegModule = z.infer<typeof modRegModuleSchema>;
export type ModRegDeleteResult = z.infer<typeof modRegDeleteResultSchema>;
