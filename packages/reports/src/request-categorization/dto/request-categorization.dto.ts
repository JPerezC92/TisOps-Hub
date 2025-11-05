import { createZodDto } from 'nestjs-zod';
import {
  insertRequestCategorizationSchema,
  updateRequestCategorizationSchema,
} from '../schemas/request-categorization-validation.schema';

export class CreateRequestCategorizationDto extends createZodDto(
  insertRequestCategorizationSchema,
) {}

export class UpdateRequestCategorizationDto extends createZodDto(
  updateRequestCategorizationSchema,
) {}
