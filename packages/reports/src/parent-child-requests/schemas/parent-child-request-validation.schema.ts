import { z } from 'zod';

/**
 * Zod validation schema for creating a parent-child request relationship
 */
export const insertParentChildRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required').max(255),
  linkedRequestId: z.string().min(1, 'Linked Request ID is required').max(255),
  requestIdLink: z.string().url('Must be a valid URL').optional(),
  linkedRequestIdLink: z.string().url('Must be a valid URL').optional(),
});

/**
 * Zod validation schema for updating a parent-child request relationship
 */
export const updateParentChildRequestSchema = z.object({
  requestId: z.string().min(1).max(255).optional(),
  linkedRequestId: z.string().min(1).max(255).optional(),
  requestIdLink: z.string().url('Must be a valid URL').optional(),
  linkedRequestIdLink: z.string().url('Must be a valid URL').optional(),
});

