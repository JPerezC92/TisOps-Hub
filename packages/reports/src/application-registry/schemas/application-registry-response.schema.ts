import { z } from 'zod';

export const appRegistryApplicationSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const appRegistryPatternSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  pattern: z.string(),
  priority: z.number(),
  matchType: z.string(),
  isActive: z.boolean(),
});

export const appRegistryWithPatternsSchema = appRegistryApplicationSchema.extend({
  patterns: z.array(appRegistryPatternSchema),
});

// Pre-composed arrays (avoids cross-package type inference issues)
export const appRegistryApplicationArraySchema = z.array(appRegistryApplicationSchema);
export const appRegistryWithPatternsArraySchema = z.array(appRegistryWithPatternsSchema);

export const appRegistryDeleteResultSchema = z.object({
  message: z.string(),
});

// Inferred types
export type AppRegistryApplicationResponse = z.infer<typeof appRegistryApplicationSchema>;
export type AppRegistryPatternResponse = z.infer<typeof appRegistryPatternSchema>;
export type AppRegistryWithPatternsResponse = z.infer<typeof appRegistryWithPatternsSchema>;
export type AppRegistryDeleteResult = z.infer<typeof appRegistryDeleteResultSchema>;
