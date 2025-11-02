# Clean Architecture Implementation Guide

## Overview

This document describes the **Clean Architecture** implementation for TisOps Hub, following **Domain-Driven Design (DDD)** principles with clear separation of concerns across three layers: Domain, Application, and Infrastructure.

## Important: Two Separate Structures

### 🏗️ API Module Structure (Clean Architecture)

**Location:** `apps/reports-api/src/{module-name}/`

Every feature module in the **API** follows this three-layer architecture:

```
apps/reports-api/src/{module-name}/
├── domain/                    # Business Logic Layer (Pure, no dependencies)
│   ├── entities/             # Domain entities with business rules
│   │   └── {entity}.entity.ts
│   ├── value-objects/        # Immutable value objects (optional)
│   └── repositories/         # Repository interfaces (ports)
│       └── {entity}.repository.interface.ts
├── application/              # Application Logic Layer (Use cases)
│   └── use-cases/           # Application-specific business rules
│       ├── get-all-{entity}.use-case.ts
│       ├── get-{entity}-by-id.use-case.ts
│       ├── create-{entity}.use-case.ts
│       ├── update-{entity}.use-case.ts
│       └── delete-{entity}.use-case.ts
└── infrastructure/           # Technical Implementation Layer (Adapters)
    ├── repositories/        # Repository implementations (uses Drizzle ORM)
    │   └── {entity}.repository.ts
    ├── {module}.module.ts   # NestJS module with factory providers
    ├── {module}.service.ts  # Orchestrates use cases
    └── {module}.controller.ts # HTTP layer
```

### 📦 Shared Package Structure (DTOs Only)

**Location:** `packages/reports/src/{module-name}/`

Shared packages contain **ONLY data contracts** - NO business logic or Clean Architecture layers:

```
packages/reports/src/{module-name}/
├── dto/                      # Data Transfer Objects (API contracts)
│   ├── create-{entity}.dto.ts  # Request DTO for creating entities
│   └── update-{entity}.dto.ts  # Request DTO for updating entities
├── entities/                 # TypeScript interfaces/types ONLY
│   └── {entity}.entity.ts   # Interface definitions (NO methods or business logic)
└── index.ts                  # Barrel exports
```

**Rules for Shared Packages:**
- ❌ **NO** business logic or class methods
- ❌ **NO** database access or ORM code
- ❌ **NO** use cases or repositories
- ❌ **NO** Clean Architecture layers (domain/application/infrastructure)
- ✅ **ONLY** DTOs (Data Transfer Objects with validation decorators)
- ✅ **ONLY** TypeScript interfaces and type definitions
- ✅ **ONLY** data contracts shared between API and frontend

### 🎯 Why Two Structures?

**Shared Package (`packages/reports/`):**
- Purpose: Share **type definitions and DTOs** between API and frontend
- Benefits: Type safety, single source of truth for contracts
- Used by: Both `apps/reports-api/` AND `apps/web/`
- Example: `import { CreateTaskDto, Task } from '@repo/reports'`

**API Module (`apps/reports-api/`):**
- Purpose: Implement **business logic** using Clean Architecture
- Benefits: Testable, maintainable, follows SOLID principles
- Used by: Only the backend API
- Example: Domain entities with `markAsCompleted()`, `calculatePriority()` methods

## Current Implementation: Tasks Module

### Complete Structure (Both API and Shared Package)

```
# Shared DTOs (packages/reports/src/tasks/)
packages/reports/src/tasks/
├── dto/
│   ├── create-task.dto.ts    # ✅ CreateTaskDto class with validation
│   └── update-task.dto.ts    # ✅ UpdateTaskDto class (all optional)
├── entities/
│   └── task.entity.ts        # ✅ Task interface (NO business logic)
└── index.ts                   # ✅ Barrel exports

# API Implementation (apps/reports-api/src/)
apps/reports-api/src/
├── database/                          # Shared database infrastructure
│   └── infrastructure/
│       ├── database.config.ts        # Turso connection
│       ├── database.module.ts        # Exports DATABASE_CONNECTION
│       ├── schemas/                  # All Drizzle schemas
│       │   ├── tasks.schema.ts      # Task table schema
│       │   └── index.ts
│       └── migrations/               # SQL migrations
└── tasks/                            # Tasks feature module
    ├── domain/
    │   ├── entities/
    │   │   └── task.entity.ts       # ✅ Pure domain entity WITH business logic
    │   └── repositories/
    │       └── task.repository.interface.ts
    ├── application/
    │   └── use-cases/               # ✅ Pure TypeScript (no decorators)
    │       ├── get-all-tasks.use-case.ts
    │       ├── get-task-by-id.use-case.ts
    │       ├── create-task.use-case.ts
    │       ├── update-task.use-case.ts
    │       └── delete-task.use-case.ts
    ├── infrastructure/
    │   └── repositories/
    │       └── task.repository.ts   # ✅ Drizzle implementation
    ├── tasks.module.ts              # ✅ NestJS wiring with factory providers
    ├── tasks.service.ts             # ✅ Orchestrator
    └── tasks.controller.ts          # ✅ REST endpoints (imports DTOs from @repo/reports)
```

### Key Differences: Shared vs API Entities

**❌ WRONG - Business Logic in Shared Package:**
```typescript
// packages/reports/src/tasks/entities/task.entity.ts
export class Task {
  markAsCompleted() { /* NO! */ }  // Business logic doesn't belong here
}
```

**✅ CORRECT - Shared Package (Pure Types):**
```typescript
// packages/reports/src/tasks/entities/task.entity.ts
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export type TaskResponse = Task;
export type TaskListResponse = Task[];
```

**✅ CORRECT - API Domain Entity (Business Logic):**
```typescript
// apps/reports-api/src/tasks/domain/entities/task.entity.ts
export class Task {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly priority: 'low' | 'medium' | 'high',
    public readonly completed: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // ✅ Business logic methods belong here
  markAsCompleted(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.priority,
      true,  // Mark as completed
      this.createdAt,
      new Date(),  // Update timestamp
    );
  }

  updatePriority(newPriority: 'low' | 'medium' | 'high'): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      newPriority,
      this.completed,
      this.createdAt,
      new Date(),
    );
  }
}
```

### Implementation Patterns

#### 1. Domain Layer (Pure Business Logic)

**Entity Example:**
```typescript
// tasks/domain/entities/task.entity.ts
export class Task {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly priority: 'low' | 'medium' | 'high',
    public readonly completed: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: data.title,
      description: data.description || null,
      priority: data.priority || 'medium',
      completed: false,
    } as any;
  }

  markAsCompleted(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.priority,
      true,
      this.createdAt,
      new Date(),
    );
  }
}
```

**Repository Interface:**
```typescript
// tasks/domain/repositories/task.repository.interface.ts
import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | null>;
  create(task: Partial<Task>): Promise<Task>;
  update(id: number, task: Partial<Task>): Promise<Task>;
  delete(id: number): Promise<void>;
}

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');
```

#### 2. Application Layer (Use Cases)

**Pure TypeScript classes - NO NestJS decorators:**

```typescript
// tasks/application/use-cases/create-task.use-case.ts
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';

export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}
  
  async execute(data: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<Task> {
    const taskData = Task.create(data);
    return this.taskRepository.create(taskData);
  }
}
```

#### 3. Infrastructure Layer (Technical Implementation)

**Repository Implementation:**
```typescript
// tasks/infrastructure/repositories/task.repository.ts
import { eq } from 'drizzle-orm';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { Task } from '../../domain/entities/task.entity';
import { Database } from '../../../database/infrastructure/database.config';
import { tasks } from '../../../database/infrastructure/schemas';

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Task[]> {
    const result = await this.db.select().from(tasks);
    return result.map(this.toDomain);
  }

  async create(taskData: Partial<Task>): Promise<Task> {
    const result = await this.db
      .insert(tasks)
      .values({
        title: taskData.title!,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        completed: taskData.completed || false,
      })
      .returning();
    return this.toDomain(result[0]);
  }

  private toDomain(data: any): Task {
    return new Task(
      data.id,
      data.title,
      data.description,
      data.priority,
      data.completed,
      data.createdAt,
      data.updatedAt,
    );
  }
}
```

**Module Wiring with Factory Providers:**
```typescript
// tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TASK_REPOSITORY } from './domain/repositories/task.repository.interface';
import { TaskRepository } from './infrastructure/repositories/task.repository';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';
import { DATABASE_CONNECTION } from '../database/infrastructure/database.module';

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    // Repository factory
    {
      provide: TASK_REPOSITORY,
      useFactory: (database) => new TaskRepository(database),
      inject: [DATABASE_CONNECTION],
    },
    // Use case factories
    {
      provide: CreateTaskUseCase,
      useFactory: (taskRepository) => new CreateTaskUseCase(taskRepository),
      inject: [TASK_REPOSITORY],
    },
    // ... other use cases
  ],
})
export class TasksModule {}
```

**Service Orchestration:**
```typescript
// tasks/tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAllTasksUseCase } from './application/use-cases/get-all-tasks.use-case';
import { CreateTaskUseCase } from './application/use-cases/create-task.use-case';

@Injectable()
export class TasksService {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
  ) {}

  async create(taskData: { title: string; description?: string }): Promise<Task> {
    return this.createTaskUseCase.execute(taskData);
  }

  async findAll(): Promise<Task[]> {
    return this.getAllTasksUseCase.execute();
  }
}
```

## Database Module Structure

The `database` module is purely infrastructure, providing shared database services:

```
apps/reports-api/src/database/
└── infrastructure/
    ├── database.config.ts      # Turso connection configuration
    ├── database.module.ts      # Exports DATABASE_CONNECTION globally
    ├── schemas/                # All Drizzle schemas (from all modules)
    │   ├── tasks.schema.ts    # Tasks table
    │   ├── reports.schema.ts  # Future: Reports table
    │   └── index.ts
    └── migrations/             # Generated SQL migrations
        ├── 0000_*.sql
        └── meta/
```

**Database Module Responsibility:**
- Provide database connection via `DATABASE_CONNECTION` token
- Centralize all Drizzle schemas
- Manage migrations

**What Database Module Does NOT Do:**
- ❌ Contains domain logic
- ❌ Contains use cases
- ❌ Contains repository implementations
- ❌ These belong in feature modules!

## Future Implementation: Reports Module

Following the same clean architecture pattern:

```
apps/reports-api/src/reports/
├── domain/
│   ├── entities/
│   │   ├── report.entity.ts
│   │   └── template.entity.ts
│   └── repositories/
│       ├── report.repository.interface.ts
│       └── template.repository.interface.ts
├── application/
│   └── use-cases/
│       ├── get-all-reports.use-case.ts
│       ├── create-report.use-case.ts
│       ├── generate-weekly-report.use-case.ts
│       └── generate-monthly-report.use-case.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── report.repository.ts
│   │   └── template.repository.ts
│   ├── reports.module.ts
│   ├── reports.service.ts
│   └── reports.controller.ts
└── dto/                        # Optional: Request/Response DTOs
    ├── create-report.dto.ts
    └── report-response.dto.ts
```

**Drizzle Schema (in database module):**
```
apps/reports-api/src/database/infrastructure/schemas/
├── reports.schema.ts          # Report table
├── templates.schema.ts        # Template table
└── index.ts                   # Export all schemas
```

## Dependency Rules

**Clean Architecture Dependency Flow:**
```
Infrastructure → Application → Domain
   (Adapters)    (Use Cases)   (Entities)
```

**Key Rules:**
1. **Domain** → No dependencies on any other layer
2. **Application** → Depends only on Domain
3. **Infrastructure** → Depends on Domain & Application, contains framework code

**Import Rules:**
- ✅ Infrastructure can import from Application and Domain
- ✅ Application can import from Domain
- ❌ Domain NEVER imports from Application or Infrastructure
- ❌ Application NEVER imports from Infrastructure

## Adding a New Feature Module

**Step-by-Step Guide:**

1. **Create Directory Structure:**
```bash
mkdir -p src/my-feature/domain/entities
mkdir -p src/my-feature/domain/repositories
mkdir -p src/my-feature/application/use-cases
mkdir -p src/my-feature/infrastructure/repositories
```

2. **Create Domain Entity:**
```typescript
// src/my-feature/domain/entities/my-entity.entity.ts
export class MyEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
  ) {}
}
```

3. **Create Repository Interface:**
```typescript
// src/my-feature/domain/repositories/my-entity.repository.interface.ts
export interface IMyEntityRepository {
  findAll(): Promise<MyEntity[]>;
}
export const MY_ENTITY_REPOSITORY = Symbol('MY_ENTITY_REPOSITORY');
```

4. **Create Use Cases (Pure TypeScript):**
```typescript
// src/my-feature/application/use-cases/get-all-my-entities.use-case.ts
export class GetAllMyEntitiesUseCase {
  constructor(private readonly repository: IMyEntityRepository) {}
  async execute(): Promise<MyEntity[]> {
    return this.repository.findAll();
  }
}
```

5. **Create Drizzle Schema (in database module):**
```typescript
// src/database/infrastructure/schemas/my-entities.schema.ts
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const myEntities = sqliteTable('my_entities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});
```

6. **Create Repository Implementation:**
```typescript
// src/my-feature/infrastructure/repositories/my-entity.repository.ts
export class MyEntityRepository implements IMyEntityRepository {
  constructor(private readonly db: Database) {}
  
  async findAll(): Promise<MyEntity[]> {
    const result = await this.db.select().from(myEntities);
    return result.map(row => new MyEntity(row.id, row.name));
  }
}
```

7. **Wire Everything in Module:**
```typescript
// src/my-feature/my-feature.module.ts
@Module({
  providers: [
    {
      provide: MY_ENTITY_REPOSITORY,
      useFactory: (db) => new MyEntityRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllMyEntitiesUseCase,
      useFactory: (repo) => new GetAllMyEntitiesUseCase(repo),
      inject: [MY_ENTITY_REPOSITORY],
    },
  ],
})
export class MyFeatureModule {}
```

8. **Generate and Apply Migration:**
```bash
cd apps/reports-api
pnpm db:generate
pnpm db:migrate
```

## Critical Pattern: Two Separate Entity Definitions

### The Confusion to Avoid

Many developers mistakenly think there should be only ONE entity definition. This leads to either:
- ❌ Putting business logic in shared packages (breaks separation of concerns)
- ❌ Not sharing types between API and frontend (loses type safety)

### The Correct Pattern: Two Definitions, Two Purposes

**1. Shared Type Definition** (in `packages/reports/src/{module}/entities/`)
```typescript
// packages/reports/src/tasks/entities/task.entity.ts
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}
```
- **Purpose**: API contract for frontend/backend communication
- **Contains**: Only properties (interfaces/types)
- **Used by**: Both API controllers and frontend components
- **Import**: `import type { Task } from '@repo/reports'`

**2. Domain Entity** (in `apps/reports-api/src/{module}/domain/entities/`)
```typescript
// apps/reports-api/src/tasks/domain/entities/task.entity.ts
export class Task {
  constructor(private props: TaskProps) {}
  
  markAsCompleted() { /* business logic */ }
  updatePriority(priority: Priority) { /* business logic */ }
}
```
- **Purpose**: Business logic and rules
- **Contains**: Properties + methods with business logic
- **Used by**: Only backend (use cases, repositories)
- **Import**: Internal to API module

### When to Use Which?

| Scenario | Use Shared Type | Use Domain Entity |
|----------|-----------------|-------------------|
| API Controller response | ✅ Yes | ❌ No |
| Frontend component | ✅ Yes | ❌ No |
| Use case logic | ❌ No | ✅ Yes |
| Repository implementation | ❌ No | ✅ Yes |
| Business rules | ❌ No | ✅ Yes |

### Example: Complete Flow

```typescript
// 1. Frontend makes request
// apps/web/app/tasks/page.tsx
import type { Task } from '@repo/reports';  // ✅ Shared type

async function getTasks(): Promise<Task[]> {
  const response = await fetch('http://localhost:3000/tasks');
  return response.json();
}

// 2. API Controller receives request
// apps/reports-api/src/tasks/tasks.controller.ts
import { CreateTaskDto } from '@repo/reports';  // ✅ Shared DTO
import type { Task } from '@repo/reports';      // ✅ Shared type

@Post()
async create(@Body() dto: CreateTaskDto): Promise<Task> {
  return this.tasksService.create(dto);
}

// 3. Use Case processes business logic
// apps/reports-api/src/tasks/application/use-cases/create-task.use-case.ts
import { Task } from '../../domain/entities/task.entity';  // ✅ Domain entity

export class CreateTaskUseCase {
  async execute(data: CreateTaskData): Promise<Task> {
    const task = Task.create(data);  // ✅ Business logic
    return this.repository.save(task);
  }
}
```

## Key Benefits

### ✅ Testability
- Use cases are pure functions - easy to unit test
- Domain logic is isolated - no framework dependencies
- Repository interfaces enable mocking

### ✅ Maintainability
- Clear separation of concerns
- Business logic is framework-agnostic
- Easy to understand code organization

### ✅ Flexibility
- Can swap ORMs without touching domain/application
- Can change frameworks without rewriting business logic
- Repository pattern allows multiple implementations

### ✅ Type Safety
- Frontend and backend share the same type contracts
- Single source of truth for API contracts
- Compiler catches breaking changes

### ✅ Scalability
- Each module is independent
- Can be extracted to microservices easily
- Team can work on different modules without conflicts

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design (DDD)](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
