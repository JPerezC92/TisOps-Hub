# TisOps Hub - AI Development Guidelines

## Project Architecture

This is a **Turborepo monorepo** following **Clean Architecture** and **Domain-Driven Design (DDD)** principles. The project contains a NestJS API and Next.js web app with shared packages organized by bounded contexts.

### Key Structure
- **apps/reports-api**: NestJS backend (port 3000) with clean architecture layers
- **apps/web**: Next.js frontend (port 3001, Turbopack enabled)
- **packages/reports**: Shared DTOs and contracts
- **packages/ui**: Shared React components with `'use client'` directives
- **packages/eslint-config**: Centralized linting with Turbo plugin
- **packages/jest-config**: Environment-specific Jest configurations

### Clean Architecture Layers (per module)

Each business domain/module in the **API** follows this structure:

```
apps/reports-api/src/{module-name}/
├── domain/                    # Business Logic (Pure, no dependencies)
│   ├── entities/             # Domain entities with business rules
│   ├── value-objects/        # Immutable value objects
│   └── repositories/         # Repository interfaces (ports)
├── application/              # Application Logic (Use cases)
│   └── use-cases/           # Application-specific business rules
└── infrastructure/           # Technical Implementation (Adapters)
    ├── config.ts            # Configuration
    ├── module.ts            # NestJS module setup
    ├── schemas/             # Database schemas (Drizzle ORM)
    ├── repositories/        # Repository implementations
    └── migrations/          # Database migrations
```

**IMPORTANT:** This clean architecture structure exists **only in the API** (`apps/reports-api/`). 
The shared packages (`packages/reports/`) contain **only DTOs and TypeScript types** for sharing contracts between frontend and backend.

### Shared DTOs Pattern

**Location:** `packages/reports/src/{module-name}/`

```
packages/reports/src/{module-name}/
├── schemas/                  # Zod Validation Schemas
│   └── {entity}-validation.schema.ts
├── dto/                      # DTO Classes (using nestjs-zod)
│   └── {entity}.dto.ts      # createZodDto wrappers
├── entities/                 # TypeScript interfaces/types ONLY
│   └── {entity}.entity.ts   # Interface definitions, NO business logic
└── index.ts                  # Barrel exports
```

**Rules for Shared Packages:**
- ❌ **NO** business logic or methods
- ❌ **NO** database access or ORM code
- ❌ **NO** use cases or repositories
- ❌ **NO** Clean Architecture layers (domain/application/infrastructure)
- ✅ **ONLY** Zod validation schemas (`z.object()`, `z.string()`, etc.)
- ✅ **ONLY** DTO classes created with `createZodDto()` from nestjs-zod
- ✅ **ONLY** TypeScript interfaces and type definitions
- ✅ **ONLY** data contracts shared between API and frontend

**Example Structure Comparison:**

```typescript
// ✅ CORRECT: Zod schema in shared package
// packages/reports/src/tasks/schemas/task-validation.schema.ts
import { z } from 'zod';

export const insertTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
});

export type CreateTaskDto = z.infer<typeof insertTaskSchema>;
```

```typescript
// ✅ CORRECT: DTO class in shared package
// packages/reports/src/tasks/dto/task.dto.ts
import { createZodDto } from 'nestjs-zod';
import { insertTaskSchema } from '../schemas/task-validation.schema';

export class CreateTaskDto extends createZodDto(insertTaskSchema) {}
```

```typescript
// ✅ CORRECT: Pure type definition in shared package
// packages/reports/src/tasks/entities/task.entity.ts
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}
```

```typescript
// ✅ CORRECT: Business logic in API domain entity
// apps/reports-api/src/tasks/domain/entities/task.entity.ts
export class Task {
  constructor(private props: TaskProps) {}
  
  markAsCompleted() {
    this.props.completed = true;
    this.props.updatedAt = new Date();
  }
}
```

**Example: Database Module Structure**
```
src/database/
├── domain/
│   ├── entities/
│   │   └── task.entity.ts              # Pure domain entity
│   └── repositories/
│       └── task.repository.interface.ts # Repository contract
├── application/
│   └── use-cases/
│       ├── get-all-tasks.use-case.ts
│       ├── create-task.use-case.ts
│       ├── update-task.use-case.ts
│       └── delete-task.use-case.ts
└── infrastructure/
    ├── database.config.ts               # Drizzle connection
    ├── database.module.ts               # NestJS DI setup
    ├── schemas/
    │   ├── index.ts
    │   └── tasks.schema.ts              # Drizzle schema
    ├── repositories/
    │   └── task.repository.ts           # Repository implementation
    └── migrations/                       # SQL migrations
```

### Database Setup (Drizzle + Turso)

**Technology Stack:**
- **ORM**: Drizzle ORM with SQLite dialect
- **Database**: Turso (SQLite cloud database)
- **Migration Tool**: drizzle-kit

**Environment Variables:**
```properties
DATABASE_URL=libsql://[database-name]-[org].turso.io
DATABASE_AUTH_TOKEN=your-token-here
```

**Database Commands:**
- `pnpm db:push` - Push schema changes directly (development)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Apply migrations to database
- `pnpm db:studio` - Open Drizzle Studio GUI
- `pnpm db:reset` - Drop all tables and recreate (⚠️ destructive)

**Important:** After `pnpm db:reset`, always use `pnpm db:migrate` (not `pnpm db:push`) to ensure the `__drizzle_migrations` table is properly recreated.

## Development Workflows

### Package Manager & Commands
- **Always use `pnpm`** - This project uses pnpm workspaces
- **Root commands use Turbo**: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint` (all use Turborepo)
- **Individual apps**: Use filters like `pnpm dev --filter=reports-api` or `pnpm build --filter=web`
- **Database commands**: Run from root using `pnpm db:*` (shortcuts to reports-api commands)
- **Dependency installation**: Run from root to maintain workspace integrity
- **Turbo benefits**: Parallel execution, smart caching, optimized builds

### Build Dependencies
- **Build order matters**: Packages must build before apps (`turbo.json` handles this)
- **Shared packages auto-rebuild**: Use `pnpm build --watch` in packages during development
- **API port**: 3000, **Web port**: 3001 (hardcoded in web's fetch calls)

### Testing Patterns
- **API tests**: Jest with `nestConfig` (Node environment, `*.spec.ts` pattern)
- **E2E tests**: `pnpm test:e2e` uses separate Jest config
- **Coverage**: Automatically collected in `coverage/` directories

## Code Patterns & Conventions

### Clean Architecture Guidelines

**Dependency Rule:** Dependencies always point inward
- Domain → No dependencies (pure business logic)
- Application → Depends on Domain only
- Infrastructure → Depends on Domain & Application

**Use Cases (Application Layer):**
- Must be pure TypeScript classes (no framework decorators)
- Accept repository interfaces via constructor injection
- Contain application-specific business logic
- Example:
```typescript
export class CreateTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}
  
  async execute(data: CreateTaskData): Promise<Task> {
    // Application logic here
    return this.taskRepository.create(data);
  }
}
```

**Repository Pattern:**
1. Define interface in `domain/repositories/` with a unique Symbol token
2. Implement in `infrastructure/repositories/` (uses Drizzle ORM)
3. Wire up in NestJS module using factory providers
4. Example:
```typescript
// Module provider
{
  provide: CreateTaskUseCase,
  useFactory: (taskRepository) => new CreateTaskUseCase(taskRepository),
  inject: [TASK_REPOSITORY],
}
```

**Entity Pattern:**
1. Pure TypeScript classes in `domain/entities/`
2. Contain business logic methods
3. No framework dependencies
4. Example methods: `markAsCompleted()`, `updatePriority()`

### NestJS API Structure
- **Module pattern**: Each feature gets its own module with clean architecture layers
- **Shared types**: Export DTOs from `packages/reports/src/entry.ts`
- **CORS enabled**: `app.enableCors()` in `main.ts`
- **Services**: Consume use cases, not repositories directly
- **Validation**: Global `ZodValidationPipe` from nestjs-zod (automatic with `createZodDto()`)
- **Swagger/OpenAPI**: Available at `http://localhost:3000/api` with automatic schema generation
- **Example**: See `apps/reports-api/src/tasks/` for the standard module structure

### Validation & Documentation Stack
- **Zod 4.1.12**: Runtime validation schemas (`z.object()`, `z.string().min()`, etc.)
- **nestjs-zod 5.0.1**: Bridges Zod with NestJS and Swagger
  - `createZodDto()` creates DTO classes from Zod schemas
  - `ZodValidationPipe` validates automatically (global provider)
  - `cleanupOpenApiDoc()` ensures proper OpenAPI output
- **@nestjs/swagger 11.2.1**: OpenAPI documentation generation
- **Pattern**: Zod schemas → DTO classes → Validation + Swagger docs (single source of truth)

### Next.js Web Patterns
- **App Router**: Uses Next.js 15+ app directory structure
- **Turbopack**: Development server uses `--turbopack` for faster builds
- **Type imports**: Import types from `@repo/reports` (e.g., `import type { Task } from '@repo/reports'`)
- **API calls**: Hardcoded to `http://localhost:3000` with `cache: 'no-store'`

### Shared Component Guidelines
- **UI exports**: Components exported as `./src/*.tsx` in `packages/ui/package.json`
- **Client components**: Add `'use client'` directive for interactive components
- **Props pattern**: Components take `appName` prop for contextual behavior (see `Button`)

### Database Schema Conventions
- **Location**: `src/database/infrastructure/schemas/`
- **File naming**: `{entity-name}.schema.ts` (e.g., `tasks.schema.ts`)
- **Table naming**: Use `sqliteTable('table_name', {...})`
- **Timestamps**: Use `integer` mode with `timestamp` and `$defaultFn(() => new Date())`
- **Exports**: Export table schema and infer types

### Import Conventions
- **Workspace references**: Use `@repo/package-name` format
- **Type-only imports**: Use `import type { }` for better tree-shaking
- **Internal imports**: Relative paths within same package, workspace references across packages
- **Layer imports**: 
  - Domain layer → No imports from application or infrastructure
  - Application layer → Only imports from domain
  - Infrastructure layer → Can import from domain and application

## Shared Tooling

### ESLint Configuration
- **Base config**: `@repo/eslint-config/base.js` with Turbo plugin
- **Framework configs**: Separate configs for NestJS (`nest.js`) and Next.js (`next.js`)
- **Prettier integration**: Automatically handled via `eslint-config-prettier`

### TypeScript Setup
- **Shared configs**: `@repo/typescript-config` with environment-specific extends
- **Build verification**: `tsc --noEmit` for type checking without output
- **Module resolution**: Workspaces resolve `@repo/*` packages automatically

### Critical Integration Points
- **API-Web communication**: Web app fetches from `localhost:3000` endpoints
- **Type sharing**: `packages/reports` exports DTOs consumed by web app
- **Build pipeline**: Turbo ensures packages build before dependent apps
- **Development sync**: Run `pnpm dev` from root to start both API and web concurrently
- **Database migrations**: Always run migrations before starting API in production

## Key Files for Understanding
- `turbo.json`: Task dependencies and caching strategy
- `pnpm-workspace.yaml`: Package discovery and build constraints
- `packages/reports/src/entry.ts`: Shared type exports
- `apps/reports-api/src/database/`: Example of clean architecture pattern
- `apps/reports-api/DATABASE_COMMANDS.md`: Comprehensive database workflow guide
- `apps/reports-api/drizzle.config.ts`: Drizzle Kit configuration for Turso

## Adding New Features

### Creating a New Module

**Step 1: Create Shared DTOs** (in `packages/reports/src/{module}/`)
1. Create folder structure: `schemas/`, `dto/`, `entities/`, `index.ts`
2. Define Zod validation schemas in `schemas/`:
   ```typescript
   // packages/reports/src/{module}/schemas/{entity}-validation.schema.ts
   import { z } from 'zod';
   
   export const insertEntitySchema = z.object({
     name: z.string().min(1).max(255),
     // ... other fields with Zod validation
   });
   
   export const updateEntitySchema = z.object({
     name: z.string().min(1).max(255).optional(),
     // ... all fields optional for updates
   });
   ```
3. Create DTO classes in `dto/` using `createZodDto()`:
   ```typescript
   // packages/reports/src/{module}/dto/{entity}.dto.ts
   import { createZodDto } from 'nestjs-zod';
   import { insertEntitySchema, updateEntitySchema } from '../schemas/{entity}-validation.schema';
   
   export class CreateEntityDto extends createZodDto(insertEntitySchema) {}
   export class UpdateEntityDto extends createZodDto(updateEntitySchema) {}
   ```
4. Define TypeScript interfaces in `entities/` (entity interface, response types - NO business logic)
5. Create barrel export in `index.ts`
6. Export from `packages/reports/src/entry.ts`:
   ```typescript
   export { CreateTaskDto, UpdateTaskDto } from './tasks/dto/task.dto';
   export type { Task, TaskResponse } from './tasks/entities/task.entity';
   ```
7. Build the package: `pnpm build --filter=@repo/reports`

**Step 2: Create API Module** (in `apps/reports-api/src/{module}/`)
1. Create clean architecture structure: `domain/`, `application/`, `infrastructure/`
2. Define domain entities with business logic in `domain/entities/`
3. Define repository interfaces in `domain/repositories/` with Symbol tokens
4. Create use cases in `application/use-cases/` (pure TypeScript classes)
5. Implement repositories in `infrastructure/repositories/`
6. Create NestJS controller importing DTOs from `@repo/reports`:
   ```typescript
   import { CreateEntityDto, UpdateEntityDto } from '@repo/reports';
   import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
   
   @ApiTags('entities')
   @Controller('entities')
   export class EntitiesController {
     @Post()
     @ApiOperation({ summary: 'Create a new entity' })
     @ApiResponse({ status: 201, type: CreateEntityDto })
     @ApiBody({ type: CreateEntityDto })
     async create(@Body() dto: CreateEntityDto) {
       // Validation automatic via global ZodValidationPipe
       // Swagger docs generated from createZodDto
     }
   }
   ```
7. Create NestJS module in `{module}.module.ts` with factory providers
8. Register module in `app.module.ts`

**Step 3: Add Database Schema** (if needed)
1. Create schema file: `src/database/infrastructure/schemas/{table}.schema.ts`
2. Export from `schemas/index.ts`
3. Generate migration: `pnpm db:generate`
4. Review migration in `migrations/` folder
5. Apply migration: `pnpm db:migrate`

**Example: Complete Tasks Module Structure**

```
# Shared DTOs (packages/reports/src/tasks/)
packages/reports/src/tasks/
├── schemas/
│   └── task-validation.schema.ts  # ✅ Zod validation schemas
├── dto/
│   └── task.dto.ts               # ✅ CreateTaskDto, UpdateTaskDto classes
├── entities/
│   └── task.entity.ts            # ✅ Task interface (no logic!)
└── index.ts                       # ✅ Barrel exports

# API Implementation (apps/reports-api/src/tasks/)
apps/reports-api/src/tasks/
├── domain/                    # ✅ Business logic & rules
│   ├── entities/
│   │   └── task.entity.ts    # Task class with methods
│   └── repositories/
│       └── task.repository.interface.ts
├── application/               # ✅ Use cases
│   └── use-cases/
│       ├── create-task.use-case.ts
│       └── get-all-tasks.use-case.ts
├── infrastructure/            # ✅ Technical details
│   └── repositories/
│       └── task.repository.ts
├── tasks.controller.ts        # ✅ Imports DTOs from @repo/reports
├── tasks.service.ts
└── tasks.module.ts
```

**Key Principles:**
- 🔀 **Shared DTOs** = Data contracts (in packages)
- 🧠 **Domain Logic** = Business rules (in apps/API)
- 📦 Both API and Frontend import from `@repo/reports`
- ⚠️ **Never** put business logic in shared packages

### Adding Database Tables
1. Create schema file: `src/database/infrastructure/schemas/{table}.schema.ts`
2. Export from `schemas/index.ts`
3. Generate migration: `pnpm db:generate`
4. Review migration in `migrations/` folder
5. Apply migration: `pnpm db:migrate`
6. Create domain entity in `domain/entities/`
7. Create repository interface in `domain/repositories/`
8. Implement repository in `infrastructure/repositories/`
9. Create use cases in `application/use-cases/`
10. Wire everything up in `infrastructure/module.ts` using factory providers