import { z } from 'zod';

export const applicationSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const applicationPatternSchema = z.object({
  id: z.number(),
  applicationId: z.number(),
  pattern: z.string(),
  priority: z.number(),
  matchType: z.string(),
  isActive: z.boolean(),
});

export const applicationWithPatternsSchema = applicationSchema.extend({
  patterns: z.array(applicationPatternSchema),
});

// Pre-composed arrays (avoids cross-package type inference issues)
export const applicationArraySchema = z.array(applicationSchema);
export const applicationWithPatternsArraySchema = z.array(applicationWithPatternsSchema);

export const appRegistryDeleteMessageSchema = z.object({
  message: z.string(),
});

// Inferred types
export type ApplicationResponse = z.infer<typeof applicationSchema>;
export type ApplicationPatternResponse = z.infer<typeof applicationPatternSchema>;
export type ApplicationWithPatternsResponse = z.infer<typeof applicationWithPatternsSchema>;
export type AppRegistryDeleteMessage = z.infer<typeof appRegistryDeleteMessageSchema>;
