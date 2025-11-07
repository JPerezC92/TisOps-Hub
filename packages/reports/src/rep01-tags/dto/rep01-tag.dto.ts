import { createZodDto } from 'nestjs-zod';
import { insertRep01TagSchema, updateRep01TagSchema } from '../schemas/rep01-tag-validation.schema';

export class CreateRep01TagDto extends createZodDto(insertRep01TagSchema) {}
export class UpdateRep01TagDto extends createZodDto(updateRep01TagSchema) {}
