import { z } from 'zod';

// Zod validation schemas for Task operations
// Note: These schemas are for API validation, not database schema

// Insert schema - used for creating new tasks
// title is required, other fields are optional
export const insertTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
});

// Update schema - used for updating existing tasks
// All fields are optional (partial update)
export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(255, 'Title is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
});

// Export types inferred from Zod schemas
export type CreateTaskDto = z.infer<typeof insertTaskSchema>;
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
