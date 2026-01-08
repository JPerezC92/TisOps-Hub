import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateRequestTagSchema = z.object({
  createdTime: z.string(),
  requestId: z.string(),
  requestIdLink: z.string().optional(),
  informacionAdicional: z.string(),
  modulo: z.string(),
  problemId: z.string(),
  linkedRequestId: z.string(),
  linkedRequestIdLink: z.string().optional(),
  jira: z.string(),
  categorizacion: z.string(),
  technician: z.string(),
});

export class CreateRequestTagDto extends createZodDto(CreateRequestTagSchema) {}
