import { createZodDto } from 'nestjs-zod';
import { insertRequestTagSchema, updateRequestTagSchema } from '../schemas/request-tag-validation.schema';

export class CreateRequestTagDto extends createZodDto(insertRequestTagSchema) {}
export class UpdateRequestTagDto extends createZodDto(updateRequestTagSchema) {}
