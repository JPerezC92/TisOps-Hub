# Shared DTO Pattern - Quick Reference

## 🎯 The Pattern in 30 Seconds

**Two separate structures, two different purposes:**

1. **`packages/reports/src/{module}/`** → Data contracts (DTOs + Types)
2. **`apps/reports-api/src/{module}/`** → Business logic (Clean Architecture)

## 📦 Shared Package Structure

```
packages/reports/src/tasks/
├── dto/                          # DTO Classes (using Zod)
│   └── task.dto.ts              # createZodDto wrappers
├── schemas/                      # Zod Validation Schemas
│   └── task-validation.schema.ts # Zod schemas
├── entities/                     # TypeScript types ONLY
│   └── task.entity.ts           # interface Task { ... }
└── index.ts                      # Barrel exports
```

### ✅ What Goes Here?
- **Zod schemas** for validation (`z.object()`, `z.string().min()`)
- **DTO classes** created with `createZodDto()` from nestjs-zod
- TypeScript interfaces for API responses
- Type aliases and enums
- **NO business logic**
- **NO class methods**

### Example:
```typescript
// packages/reports/src/tasks/schemas/task-validation.schema.ts
import { z } from 'zod';

export const insertTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  completed: z.boolean().optional(),
});

export type CreateTaskDto = z.infer<typeof insertTaskSchema>;
```

```typescript
// packages/reports/src/tasks/dto/task.dto.ts
import { createZodDto } from 'nestjs-zod';
import { insertTaskSchema, updateTaskSchema } from '../schemas/task-validation.schema';

// DTO classes for NestJS + Swagger
export class CreateTaskDto extends createZodDto(insertTaskSchema) {}
export class UpdateTaskDto extends createZodDto(updateTaskSchema) {}
```

```typescript
// packages/reports/src/tasks/entities/task.entity.ts
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}
```

## 🏗️ API Module Structure

```
apps/reports-api/src/tasks/
├── domain/
│   ├── entities/
│   │   └── task.entity.ts       # class Task with business methods
│   └── repositories/
│       └── task.repository.interface.ts
├── application/
│   └── use-cases/               # Business logic
│       ├── create-task.use-case.ts
│       └── get-all-tasks.use-case.ts
├── infrastructure/
│   └── repositories/
│       └── task.repository.ts   # Database implementation
├── tasks.controller.ts          # Imports DTOs from @repo/reports
├── tasks.service.ts
└── tasks.module.ts
```

### ✅ What Goes Here?
- Business logic and rules
- Domain entities with methods (`markAsCompleted()`, `validate()`)
- Use cases (application logic)
- Repository implementations
- **All the Clean Architecture layers**

### Example:
```typescript
// apps/reports-api/src/tasks/domain/entities/task.entity.ts
export class Task {
  constructor(private props: TaskProps) {}
  
  markAsCompleted(): void {
    this.props.completed = true;
    this.props.updatedAt = new Date();
  }
  
  canBeDeleted(): boolean {
    return !this.props.completed;
  }
}
```

## 🔄 How They Work Together

### 1. Frontend Imports Shared Types
```typescript
// apps/web/app/tasks/page.tsx
import type { Task } from '@repo/reports';  // ✅ Shared interface

const tasks: Task[] = await fetch('/tasks').then(r => r.json());
```

### 2. API Controller Imports Shared DTOs
```typescript
// apps/reports-api/src/tasks/tasks.controller.ts
import { CreateTaskDto, UpdateTaskDto } from '@repo/reports';  // ✅ Shared DTOs (Zod-based)
import type { Task } from '@repo/reports';                     // ✅ Shared type
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiResponse({ status: 201, type: CreateTaskDto })
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    // Validation happens automatically via ZodValidationPipe
    // Swagger docs generated automatically from Zod schema
    return this.tasksService.create(dto);
  }
}
```

### 3. Use Cases Use Domain Entities
```typescript
// apps/reports-api/src/tasks/application/use-cases/create-task.use-case.ts
import { Task } from '../../domain/entities/task.entity';  // ✅ Domain entity (class)

export class CreateTaskUseCase {
  async execute(data: CreateTaskData): Promise<Task> {
    const task = Task.create(data);  // Business logic here
    if (!task.isValid()) throw new Error('Invalid task');
    return this.repository.save(task);
  }
}
```

## ⚠️ Common Mistakes

### ❌ DON'T: Put Business Logic in Shared Package
```typescript
// packages/reports/src/tasks/entities/task.entity.ts
export class Task {
  markAsCompleted() { }  // ❌ NO! Business logic doesn't belong here
}
```

### ❌ DON'T: Use Domain Entity in Controller Response
```typescript
// apps/reports-api/src/tasks/tasks.controller.ts
import { Task } from './domain/entities/task.entity';  // ❌ NO!

@Get()
async findAll(): Promise<Task[]> {  // ❌ Don't return domain entities
  return this.service.findAll();
}
```

### ✅ DO: Use Shared Types for API Contracts
```typescript
// apps/reports-api/src/tasks/tasks.controller.ts
import type { Task } from '@repo/reports';  // ✅ YES! Shared type

@Get()
async findAll(): Promise<Task[]> {  // ✅ Return shared type
  return this.service.findAll();
}
```

## 📋 Checklist for New Module

When creating a new module, create BOTH structures:

### Step 1: Create Shared Package
- [ ] Create `packages/reports/src/{module}/schemas/` folder
- [ ] Create `packages/reports/src/{module}/dto/` folder
- [ ] Create `packages/reports/src/{module}/entities/` folder
- [ ] Define Zod schemas for validation (insert, update)
- [ ] Create DTO classes using `createZodDto()`
- [ ] Define TypeScript interfaces (no methods!)
- [ ] Export from `packages/reports/src/{module}/index.ts`
- [ ] Export from `packages/reports/src/entry.ts`
- [ ] Build package: `pnpm build --filter=@repo/reports`

### Step 2: Create API Module
- [ ] Create `apps/reports-api/src/{module}/domain/` folder
- [ ] Create `apps/reports-api/src/{module}/application/` folder
- [ ] Create `apps/reports-api/src/{module}/infrastructure/` folder
- [ ] Define domain entity with business methods
- [ ] Create use cases
- [ ] Implement repositories
- [ ] Create NestJS controller (import DTOs from `@repo/reports`)
- [ ] Create NestJS module with factory providers

## 🎓 Key Takeaways

1. **Shared packages** = Type contracts + Zod validation, **API modules** = Business logic
2. Two entity definitions are **intentional**, not a mistake
3. Frontend and API **both** import from `@repo/reports`
4. Domain entities stay **private** to the API
5. Clean Architecture layers **only** in API modules
6. **Zod schemas** provide both runtime validation and Swagger documentation
7. `createZodDto()` bridges Zod with NestJS and Swagger

## 🛠️ Technology Stack

- **Zod 4.1.12** - Runtime validation schemas
- **nestjs-zod 5.0.1** - Zod integration for NestJS
- **@nestjs/swagger 11.2.1** - OpenAPI/Swagger documentation
- **Validation**: Automatic via global `ZodValidationPipe`
- **Swagger UI**: Available at `http://localhost:3000/api`

## 📚 Related Documentation

- [`CLEAN_ARCHITECTURE.md`](./CLEAN_ARCHITECTURE.md) - Full Clean Architecture guide
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) - Complete project guidelines
- [`ARCHITECTURE_PLAN.md`](./ARCHITECTURE_PLAN.md) - Project architecture overview
