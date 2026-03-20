import { z } from 'zod';

const isoDateString = z.preprocess(
  (val) => (val instanceof Date ? val.toISOString() : val),
  z.string(),
);

export const catRegCategorizationSchema = z.object({
  id: z.number(),
  sourceValue: z.string(),
  displayValue: z.string(),
  isActive: z.boolean(),
  createdAt: isoDateString,
  updatedAt: isoDateString,
});

export const catRegCategorizationArraySchema = z.array(catRegCategorizationSchema);

export const catRegDeleteResultSchema = z.object({
  deleted: z.boolean(),
});

// Inferred types
export type CatRegCategorization = z.infer<typeof catRegCategorizationSchema>;
export type CatRegDeleteResult = z.infer<typeof catRegDeleteResultSchema>;
