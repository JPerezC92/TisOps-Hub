import { z } from 'zod';
import { requestIdEntrySchema } from '../../request-categorization/schemas/request-categorization-response.schema';

export const byAdditionalInfoResponseSchema = z.object({
  requestIds: z.array(requestIdEntrySchema),
});

export const missingIdsResponseSchema = z.object({
  missingIds: z.array(requestIdEntrySchema),
});

export type ByAdditionalInfoResponse = z.infer<typeof byAdditionalInfoResponseSchema>;
export type MissingIdsResponse = z.infer<typeof missingIdsResponseSchema>;
