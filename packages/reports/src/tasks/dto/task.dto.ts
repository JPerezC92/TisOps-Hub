import { createZodDto } from 'nestjs-zod';
import { insertTaskSchema, updateTaskSchema } from '../schemas/task-validation.schema';

// Create DTO from insert schema
export class CreateTaskDto extends createZodDto(insertTaskSchema) {}

// Create DTO from update schema
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
