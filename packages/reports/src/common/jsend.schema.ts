import { z } from 'zod';

export function jsendSuccess<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: z.literal('success'),
    data: dataSchema,
  });
}

/**
 * Parses a raw API response as a JSend success envelope and validates the data.
 * Returns the validated data directly (unwrapped from the envelope).
 */
export function parseJsendData<T>(schema: z.ZodType<T>, raw: unknown): T {
  const response = z
    .object({ status: z.literal('success'), data: schema })
    .parse(raw);
  return response.data;
}
