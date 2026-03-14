---
name: clean-architecture
description: Reference blueprint for how backend API modules must be structured following Clean Architecture
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

# Clean Architecture — Backend Module Blueprint

This skill defines the canonical structure for all `apps/reports-api` modules. Use it when creating, reviewing, or migrating any module.

## Directory Structure

```
apps/reports-api/src/{module}/
├── domain/
│   ├── entities/
│   │   └── {entity}.entity.ts
│   ├── errors/
│   │   └── {entity}-not-found.error.ts
│   └── repositories/
│       └── {entity}.repository.interface.ts
├── application/
│   └── use-cases/
│       ├── get-all-{entities}.use-case.ts
│       ├── get-{entity}-by-id.use-case.ts
│       ├── create-{entity}.use-case.ts
│       ├── update-{entity}.use-case.ts
│       └── delete-{entity}.use-case.ts
└── infrastructure/
    ├── adapters/              # DB record → domain entity mappers
    │   └── {entity}.adapter.ts
    ├── dtos/                  # Optional: createZodDto() wrappers for @Body() validation
    │   └── create-{entity}.dto.ts
    ├── repositories/
    │   └── {entity}.repository.ts
    ├── services/              # Optional: parsers, external adapters
    │   └── {name}.service.ts
    ├── {module}.controller.ts
    └── {module}.module.ts
```

## Layer Rules

### Domain Layer (`domain/`)

Pure TypeScript. Zero framework imports. Zero infrastructure imports.

**Entity** — immutable class with private fields, getters, and a static `create()` factory:

```typescript
export class TaskEntity {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly status: string,
  ) {}

  static create(id: string, name: string, status: string): TaskEntity {
    return new TaskEntity(id, name, status);
  }

  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getStatus(): string { return this.status; }
}
```

**Repository Interface** — defines a Symbol token for DI and the contract:

```typescript
import { TaskEntity } from '@tasks/domain/entities/task.entity';

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

export interface ITaskRepository {
  findAll(): Promise<TaskEntity[]>;
  findById(id: string): Promise<TaskEntity | null>;
  create(entity: TaskEntity): Promise<TaskEntity>;
  update(id: string, data: { name?: string; status?: string }): Promise<TaskEntity>;
  delete(id: string): Promise<void>;
}
```

### Application Layer (`application/`)

Pure TypeScript classes. No `@Injectable()`, no decorators, no framework imports. Each use case does **one thing**.

```typescript
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { TaskEntity } from '@tasks/domain/entities/task.entity';
import { TaskNotFoundError } from '@tasks/domain/errors/task-not-found.error';

// No arguments — simple delegation
export class GetAllTasksUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(): Promise<TaskEntity[]> {
    return this.repository.findAll();
  }
}

// Returns domain error on failure (NOT throw)
export class GetTaskByIdUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(id: string): Promise<TaskEntity | TaskNotFoundError> {
    const task = await this.repository.findById(id);
    if (!task) {
      return new TaskNotFoundError(id);
    }
    return task;
  }
}

// Update — validates existence before delegating
export class UpdateTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(id: string, data: UpdateTaskDto): Promise<TaskEntity | TaskNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new TaskNotFoundError(id);
    }
    return this.repository.update(id, data);
  }
}

// Delete — validates existence before delegating
export class DeleteTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(id: string): Promise<void | TaskNotFoundError> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return new TaskNotFoundError(id);
    }
    await this.repository.delete(id);
  }
}
```

Use cases receive dependencies via constructor (injected by the module's factory providers). `execute()` accepts whatever arguments the operation needs — none, a single ID, multiple params, or full entities. They must only depend on domain interfaces, never on infrastructure.

**Args convention:** Use plain parameters for up to 4 arguments. For 5+ arguments, group them into an interface defined in the same use case file.

### Infrastructure Layer (`infrastructure/`)

All framework-dependent code lives here: NestJS decorators, Drizzle ORM, external libraries.

**Adapter** — converts DB records to domain entities. Static methods, one adapter per entity:

```typescript
// infrastructure/adapters/task.adapter.ts
import type { DbTask } from '@repo/database';
import { TaskEntity } from '@tasks/domain/entities/task.entity';

export class TaskAdapter {
  static toDomain(record: DbTask): TaskEntity {
    return new TaskEntity(record.id, record.name, record.status);
  }
}
```

**Naming convention:**

- **Class:** `{Entity}Adapter` in `infrastructure/adapters/{entity}.adapter.ts`
- **Method:** static `toDomain()` — converts a single DB record into a domain entity
- **Multiple entities:** one adapter class per entity; can share a file if tightly coupled (e.g., `ApplicationAdapter` + `ApplicationPatternAdapter` in `application.adapter.ts`)

**DB type imports:** Always `import type` the exported type alias from `@repo/database` — never use `typeof schema.$inferSelect`.

| Scenario | Convention | Example |
|----------|-----------|---------|
| DB type name ≠ domain entity name | Use as-is | `import type { ApplicationRegistry } from '@repo/database'` |
| Already has `Db` prefix in `@repo/database` | Use as-is | `import type { DbTask } from '@repo/database'` |
| DB type name = domain entity name (clash) | Alias with `Db` prefix | `import type { ErrorLog as DbErrorLog } from '@repo/database'` |

Known clashing types that need aliasing: `ErrorLog`, `ApplicationPattern`.

**Repository Implementation** — implements the domain interface using Drizzle. Uses the adapter for mapping:

```typescript
// infrastructure/repositories/task.repository.ts
import { eq } from 'drizzle-orm';
import { Database, tasks } from '@repo/database';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { TaskEntity } from '@tasks/domain/entities/task.entity';
import { TaskAdapter } from '@tasks/infrastructure/adapters/task.adapter';

export class TaskRepository implements ITaskRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<TaskEntity[]> {
    const results = await this.db.select().from(tasks);
    return results.map(TaskAdapter.toDomain);
  }

  // ... other methods
}
```

**Controller** — injects use cases directly. No service facade. Explicitly wraps responses in JSend format and throws DomainErrors. Uses `@ZodResponse` for combined runtime serialization + Swagger documentation + compile-time type checking:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import { taskSchema, taskArraySchema, taskDeleteResultSchema } from '@repo/reports';
import { jsendSuccess, jsendFailSchema } from '@repo/reports/common';
import { DomainError } from '@shared/domain/errors/domain.error';
import type { CreateTaskDto, UpdateTaskDto } from '@tasks/domain/repositories/task.repository.interface';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { GetTaskByIdUseCase } from '@tasks/application/use-cases/get-task-by-id.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { UpdateTaskUseCase } from '@tasks/application/use-cases/update-task.use-case';
import { DeleteTaskUseCase } from '@tasks/application/use-cases/delete-task.use-case';

// JSend success DTOs — used by @ZodResponse for both runtime serialization and Swagger docs
class JSendTaskArrayDto extends createZodDto(jsendSuccess(taskArraySchema)) {}
class JSendTaskDto extends createZodDto(jsendSuccess(taskSchema)) {}
class JSendTaskDeleteResultDto extends createZodDto(jsendSuccess(taskDeleteResultSchema)) {}

// JSend fail DTO — used by @ApiResponse for Swagger error documentation only
class JSendFailDto extends createZodDto(jsendFailSchema) {}

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getTaskByIdUseCase: GetTaskByIdUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ZodResponse({ status: 200, description: 'Returns all tasks', type: JSendTaskArrayDto })
  async findAll() {
    const data = await this.getAllTasksUseCase.execute();
    return { status: 'success' as const, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Returns the task', type: JSendTaskDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getTaskByIdUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @ZodResponse({ status: 201, description: 'Task created successfully', type: JSendTaskDto })
  async create(@Body() data: CreateTaskDto) {
    const result = await this.createTaskUseCase.execute(data);
    return { status: 'success' as const, data: result };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Task updated successfully', type: JSendTaskDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTaskDto) {
    const result = await this.updateTaskUseCase.execute(id, data);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: result };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ZodResponse({ status: 200, description: 'Task deleted successfully', type: JSendTaskDeleteResultDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: JSendFailDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.deleteTaskUseCase.execute(id);
    if (result instanceof DomainError) throw result;
    return { status: 'success' as const, data: { deleted: true } };
  }
}
```

> **Controller rules:**
> - **Explicit JSend wrapping** — every endpoint returns `{ status: 'success' as const, data }`.
> - **DomainError handling** — endpoints that call use cases returning `T | DomainError` must check: `if (result instanceof DomainError) throw result`. The `DomainErrorFilter` catches the thrown error and returns the JSend fail response.
> - **`@ZodResponse`** — single decorator that combines runtime Zod serialization, Swagger documentation, HTTP status code, and compile-time return type checking. Replaces `@ApiResponse` + `@ZodSerializerDto`.
> - **`@ApiResponse` for errors only** — used exclusively for documenting error responses (404, 409) in Swagger. Error paths are thrown, not returned, so `@ZodResponse` doesn't apply.
> - **JSend DTOs** — defined at the top of the controller file using `createZodDto(jsendSuccess(rawSchema))`. One DTO serves both runtime serialization and Swagger docs.
> - **`JSendFailDto`** — shared across endpoints, documents the `{ status: 'fail', data: { message, code } }` shape.

**DTOs** — `createZodDto()` wrappers for request body validation. Only used by the controller via `@Body()`:

```typescript
import { createZodDto } from 'nestjs-zod';
import { insertTaskSchema } from '@repo/reports';

export class CreateTaskDto extends createZodDto(insertTaskSchema) {}
```

> **Validation boundary rules:**
> - **Zod schemas** (pure validation) → `@repo/reports` (shared between frontend and backend)
> - **`createZodDto()` wrappers** (NestJS-specific) → `infrastructure/dtos/` (consumed only by controller `@Body()`)
> - **`application/` layer** → never has DTOs. Use cases receive plain params or domain entities, never DTO classes.

**JSend helpers** (from `@repo/reports/common`):
- `jsendSuccess(schema)` — wraps a Zod schema in `{ status: z.literal('success'), data: schema }`
- `jsendFailSchema` — `{ status: z.literal('fail'), data: { message: z.string(), code: z.string() } }`

> **Date fields:** Use `z.preprocess((val) => val instanceof Date ? val.toISOString() : val, z.string())` in Zod schemas for Date-to-ISO serialization. This produces `string` in JSON Schema (Swagger-compatible) while accepting `Date` objects at runtime.

**Module** — wires everything with factory providers. No service class:

```typescript
import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@repo/database';
import { TASK_REPOSITORY } from '@tasks/domain/repositories/task.repository.interface';
import { TaskRepository } from '@tasks/infrastructure/repositories/task.repository';
import { GetAllTasksUseCase } from '@tasks/application/use-cases/get-all-tasks.use-case';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';
import { TaskController } from '@tasks/infrastructure/tasks.controller';

@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: TASK_REPOSITORY,
      useFactory: (db) => new TaskRepository(db),
      inject: [DATABASE_CONNECTION],
    },
    {
      provide: GetAllTasksUseCase,
      useFactory: (repo) => new GetAllTasksUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
    {
      provide: CreateTaskUseCase,
      useFactory: (repo) => new CreateTaskUseCase(repo),
      inject: [TASK_REPOSITORY],
    },
  ],
})
export class TaskModule {}
```

## Global Infrastructure

Registered in `app.module.ts`:

```typescript
providers: [
  { provide: APP_PIPE, useClass: ZodValidationPipe },
  { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
],
```

- `ZodValidationPipe` — validates `@Body()` input against Zod schemas
- `ZodSerializerInterceptor` — enables `@ZodResponse` runtime serialization

The `DomainErrorFilter` is registered in `main.ts` via `app.useGlobalFilters()`.

## Domain Errors

Domain errors express business rule violations as **values, not exceptions**. Use cases **return** domain errors — they never throw them.

### Error flow

1. **Use case** — returns `T | SomeDomainError` (explicit in the type signature)
2. **Controller** — checks for DomainError and throws: `if (result instanceof DomainError) throw result`
3. **`DomainErrorFilter`** (global) — catches thrown domain errors and maps to HTTP + JSend fail format via suffix convention

The controller owns the DomainError check because it explicitly wraps success responses in JSend format. Throwing the error ensures it bypasses the JSend wrapping and goes straight to the filter.

### Directory structure

```
domain/errors/
└── {entity}-not-found.error.ts
```

### Creating a domain error

Each module defines its own concrete error classes in `domain/errors/`. They extend the shared `DomainError` base and reference centralized error codes and messages:

```typescript
// domain/errors/task-not-found.error.ts
import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { ERROR_MESSAGES } from '@shared/domain/errors/error.messages';

export class TaskNotFoundError extends DomainError {
  readonly code = ERROR_CODES.TASK_NOT_FOUND;

  constructor(id: number) {
    super(ERROR_MESSAGES[ERROR_CODES.TASK_NOT_FOUND](id));
  }
}
```

When adding a new domain error:
1. Add the error code to `shared/domain/errors/error-codes.ts`
2. Add the message factory to `shared/domain/errors/error.messages.ts`
3. Create the error class in `{module}/domain/errors/`

### Suffix-based HTTP mapping

The `DomainErrorFilter` auto-maps error codes to HTTP statuses by suffix:

| Suffix | HTTP Status | Example code |
|--------|------------|--------------|
| `_NOT_FOUND` | 404 | `APPLICATION_NOT_FOUND` |
| `_ALREADY_EXISTS` | 409 | `REQUEST_TAG_ALREADY_EXISTS` |

No need to update the filter for each new error — just follow the suffix convention.

### Error naming convention

| Component | Pattern | Example |
|-----------|---------|---------|
| Error code | `{ENTITY}_NOT_FOUND` | `CORRECTIVE_STATUS_NOT_FOUND` |
| Error class | `{Entity}NotFoundError` | `CorrectiveStatusNotFoundError` |
| File name | `{entity}-not-found.error.ts` | `corrective-status-not-found.error.ts` |

### Where errors live

| Layer | Throws? | Returns? | Imports domain errors? |
|-------|---------|----------|----------------------|
| **Domain** (errors/) | — | — | Defines them |
| **Application** (use cases) | Never | Yes (`return new XNotFoundError(id)`) | Yes |
| **Infrastructure** (repositories) | Never | No — returns `null` from `findById` | No |
| **Infrastructure** (controller) | Yes (`if (result instanceof DomainError) throw result`) | Wraps success in `{ status: 'success', data }` | Yes (`DomainError` base class) |
| **Infrastructure** (DomainErrorFilter) | — | Maps to HTTP JSON `{ status: 'fail', data: { message, code } }` | Yes (shared) |

### Use case tests for domain errors

```typescript
it('should return TaskNotFoundError when not found', async () => {
  mockRepository.findById.mockResolvedValue(null);

  const result = await useCase.execute(999);

  expect(DomainError.isDomainError(result)).toBe(true);
  expect(result).toBeInstanceOf(TaskNotFoundError);
  expect((result as TaskNotFoundError).message).toBe('Task with ID 999 not found');
});
```

### Controller tests for domain errors

Controller integration tests must register the filter to catch thrown DomainErrors:

```typescript
app = moduleFixture.createNestApplication();
app.useGlobalFilters(new DomainErrorFilter());
await app.init();
```

The 404 assertion uses JSend fail format:

```typescript
expect(response.body).toMatchObject({
  status: 'fail',
  data: {
    message: 'Task with ID 999 not found',
    code: ERROR_CODES.TASK_NOT_FOUND,
  },
});
```

## Key Principles

| Rule | Right | Wrong |
|------|-------|-------|
| Imports | `@tasks/application/use-cases/...` (path aliases) | `../application/use-cases/...` (relative) |
| Controller DI | Inject use cases directly | Inject a service facade |
| Use case DI | Constructor receives domain interfaces | Any NestJS decorator (`@Inject()`, `@Injectable()`) |
| Domain layer | Zero framework imports | `import { Injectable } from '@nestjs/common'` |
| Response format | Controller wraps `{ status: 'success' as const, data }` + `@ZodResponse` | Returning raw and relying on interceptor to wrap |
| Response decorator | `@ZodResponse({ status, description, type })` | Separate `@ApiResponse` + `@ZodSerializerDto` |
| Error handling | Controller: `if (result instanceof DomainError) throw result` | Returning DomainError and relying on interceptor |
| Swagger error docs | `@ApiResponse({ status: 404, type: JSendFailDto })` | No error documentation |
| Repository token | `Symbol('TASK_REPOSITORY')` | String token or class ref |
| DB injection | `DATABASE_CONNECTION` token via factory | Direct `db` import from `@repo/database` |
| Domain errors | Use case **returns** `new XNotFoundError(id)` | Use case **throws** or repository throws `NotFoundException` |
| Existence checks | In use case (`findById` → return error) | In repository (`findById` → throw) |

## What Does NOT Exist

- **No `service.ts`** — the service facade pattern is eliminated. Controllers call use cases directly.
- **No files at module root** — controller, module, and service must NOT sit at the module root. They belong in `infrastructure/`.
- **No generic filenames** — controller and module files must include the module name: `{module}.controller.ts`, `{module}.module.ts` (not bare `controller.ts` / `module.ts`).
- **No `@Injectable()` on use cases or repositories** — both are plain classes, instantiated by factory providers in the module.

## App Module Registration

```typescript
// apps/reports-api/src/app.module.ts
// Note: app.module.ts uses relative paths since it's the composition root
import { TaskModule } from './tasks/infrastructure/tasks.module';
```

## Zod Response Schema Naming Convention

All Zod response schemas live in `packages/reports/src/{module}/schemas/{module}-response.schema.ts` and follow this pattern:

```
{modulePrefix}{EntityOrAction}{Schema|ArraySchema}
```

**Module prefixes** (camelCase abbreviation):
- `request-tags` → `requestTag`
- `application-registry` → `appRegistry`
- `request-categorization` → `reqCat`

| Category | Pattern | Example |
|----------|---------|---------|
| Entity | `{prefix}{Entity}Schema` | `appRegistryApplicationSchema` |
| Entity array | `{prefix}{Entity}ArraySchema` | `appRegistryApplicationArraySchema` |
| Composed response | `{prefix}{Description}ResponseSchema` | `requestTagListResponseSchema` |
| Action result | `{prefix}{Action}ResultSchema` | `requestTagUploadResultSchema` |
| Delete result | `{prefix}DeleteResultSchema` | `reqCatDeleteResultSchema` |

**Type naming:** Same as schema name without `Schema` suffix → `RequestTagListResponse`, `AppRegistryDeleteResult`

**Frontend services** use `parseJsendData(zodSchema, raw)` for runtime validation:
```typescript
const raw = await apiClient.get<unknown>('/endpoint');
return parseJsendData(requestTagListResponseSchema, raw);
```

**Important:** After adding/modifying schemas in `@repo/reports`, run `pnpm --filter @repo/reports build` before running tests.

## Checklist

When creating or reviewing a module, verify:

- [ ] Entity has private fields, getters, and `static create()`
- [ ] Repository interface defines a `Symbol` token and returns domain entities
- [ ] Use cases are plain TS classes with a single `execute()` method
- [ ] Use cases only import from `domain/` — never from `infrastructure/`
- [ ] Repository is a plain class (no `@Injectable()`), instantiated by module factory with `DATABASE_CONNECTION`
- [ ] DB-to-domain mapping lives in `infrastructure/adapters/{entity}.adapter.ts` with static `toDomain()`
- [ ] Controller lives in `infrastructure/{module}.controller.ts`
- [ ] Controller injects use cases, not a service
- [ ] Controller wraps success in `{ status: 'success' as const, data }` and throws DomainErrors
- [ ] Controller uses `@ZodResponse` for success responses (runtime + Swagger + type-check)
- [ ] Controller uses `@ApiResponse` with `JSendFailDto` for error documentation (404, 409)
- [ ] JSend DTOs defined at top of controller: `createZodDto(jsendSuccess(rawSchema))`
- [ ] Module lives in `infrastructure/{module}.module.ts`
- [ ] Module uses factory providers for use cases and repository
- [ ] DTOs using `createZodDto()` live in `infrastructure/dtos/`, not `application/`
- [ ] Zod schemas live in `@repo/reports`, not duplicated in the module
- [ ] All Zod schema names use the module prefix (`reqCat*`, `appRegistry*`, `requestTag*`)
- [ ] Frontend service uses `parseJsendData(zodSchema, raw)`, not `JSendSuccess<T>` type cast
- [ ] All imports use tsconfig path aliases (`@{module}/...`)
- [ ] `app.module.ts` imports from `./module-name/infrastructure/{module}.module`
- [ ] Domain errors live in `domain/errors/` and extend `DomainError`
- [ ] Error codes and messages are registered in `shared/domain/errors/`
- [ ] Use cases **return** domain errors (never throw)
- [ ] Repositories have no existence checks — they return `null` from `findById`, use cases handle not-found
- [ ] Repositories have zero `NotFoundException` imports
- [ ] Controller tests register `DomainErrorFilter`

## Reference Implementation

`corrective-status-registry` is the fully migrated reference module with the complete pattern (`@ZodResponse`, explicit JSend wrapping, DomainError throwing). See:
- Entity: `src/corrective-status-registry/domain/entities/corrective-status.entity.ts`
- Domain error: `src/corrective-status-registry/domain/errors/corrective-status-not-found.error.ts`
- Repository interface: `src/corrective-status-registry/domain/repositories/corrective-status-registry.repository.interface.ts`
- Use cases: `src/corrective-status-registry/application/use-cases/`
- Adapter: `src/corrective-status-registry/infrastructure/adapters/corrective-status.adapter.ts`
- Repository impl: `src/corrective-status-registry/infrastructure/repositories/corrective-status-registry.repository.ts`
- Controller: `src/corrective-status-registry/infrastructure/corrective-status-registry.controller.ts`
- Module: `src/corrective-status-registry/infrastructure/corrective-status-registry.module.ts`
- Zod schemas: `packages/reports/src/corrective-status-registry/schemas/corrective-status-response.schema.ts`
- Controller tests: `test/corrective-status-registry/corrective-status-registry.controller.spec.ts`
