import { createZodDto } from 'nestjs-zod';
import {
  insertParentChildRequestSchema,
  updateParentChildRequestSchema,
} from '../schemas/parent-child-request-validation.schema';

/**
 * DTO for creating a parent-child request relationship
 * Automatically validates using Zod schema
 */
export class CreateParentChildRequestDto extends createZodDto(
  insertParentChildRequestSchema,
) {}

/**
 * DTO for updating a parent-child request relationship
 * Automatically validates using Zod schema
 */
export class UpdateParentChildRequestDto extends createZodDto(
  updateParentChildRequestSchema,
) {}
