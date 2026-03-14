# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (starts both API on :3000 and web on :3001)
pnpm dev

# Build all
pnpm build

# Lint
pnpm lint

# Run all unit tests (via Turbo)
pnpm test

# Run specific package tests
pnpm --filter reports-api test
pnpm --filter web test

# Run a single test file
pnpm --filter reports-api test -- path/to/file.spec.ts
pnpm --filter web test -- path/to/file.spec.ts

# Run all E2E tests (backend in-memory + frontend Playwright)
pnpm turbo test:e2e --force

# Keep E2E test database for debugging (set env before running)
export E2E_KEEP_DB=1
pnpm turbo test:e2e --force

# Run only frontend E2E
pnpm --filter web exec playwright test

# Run a single Playwright test file
pnpm --filter web exec playwright test e2e/__tests__/smoke.spec.ts

# Database commands (proxied to reports-api, uses .env)
pnpm db:generate    # Generate migration from schema changes
pnpm db:migrate     # Apply migrations
pnpm db:push        # Push schema directly (dev only)
pnpm db:studio      # Open Drizzle Studio GUI
pnpm db:reset       # Drop all tables + migrate + seed (destructive)
```

## Architecture

**Turborepo monorepo** with pnpm workspaces. Two apps, six shared packages.

### Apps

- **`apps/reports-api`** — NestJS backend (port 3000). Each module follows **Clean Architecture**: `domain/` (entities, repository interfaces) → `application/` (use cases) → `infrastructure/` (Drizzle repos, NestJS controller/module). Dependencies point inward.
- **`apps/web`** — Next.js 16 frontend (port 3001, Turbopack). App Router with `app/` pages. Feature code lives in `modules/{feature}/` with components, hooks, and services.

### Packages

- **`@repo/database`** — Drizzle ORM schemas and Turso config. All table schemas defined here in `src/schemas/`. Shared by API.
- **`@repo/reports`** — Shared DTOs and TypeScript types between API and web. Contains Zod validation schemas, `createZodDto()` classes, and entity interfaces. **No business logic** — only data contracts.
- **`@repo/ui`** — Shared React components (shadcn/ui pattern).
- **`@repo/eslint-config`** — Shared ESLint config.
- **`@repo/typescript-config`** — Shared TypeScript config.
- **`@repo/vitest-config`** — Shared Vitest config.

### API Module Structure (Target)

Fully migrated modules place all NestJS/framework code inside `infrastructure/`. The controller injects use cases directly — no service facade layer.

```
apps/reports-api/src/{module}/
├── domain/
│   ├── entities/          # Domain entities with business logic
│   └── repositories/      # Repository interfaces (ports) with Symbol tokens
├── application/
│   └── use-cases/         # Pure TS classes, no framework decorators
└── infrastructure/
    ├── repositories/      # Drizzle ORM implementations
    ├── services/          # Infrastructure services (e.g., parsers)
    ├── {module}.controller.ts  # NestJS controller, injects use cases directly
    └── {module}.module.ts      # NestJS module with factory providers
```

Use cases are wired via factory providers injecting repository interfaces:
```typescript
{ provide: CreateTaskUseCase, useFactory: (repo) => new CreateTaskUseCase(repo), inject: [TASK_REPOSITORY] }
```

> **Migration status:** `request-categorization` is fully migrated. Other modules still have `controller.ts`, `service.ts`, and `module.ts` at the module root. When migrating: move controller/module into `infrastructure/`, eliminate the service facade, and have the controller call use cases directly.

### API Response Format

All API endpoints return **JSend format**: `{ status: "success", data: {...} }`. The frontend must access `.data` on responses.

### Database

- **Turso** (SQLite cloud) with **Drizzle ORM**
- Schemas in `packages/database/src/schemas/`
- Migrations in `apps/reports-api/src/database/infrastructure/migrations/`
- Validation: Zod schemas in `@repo/reports` → `createZodDto()` → auto-validated by global `ZodValidationPipe`

### E2E Test Infrastructure

- **Backend E2E** (`reports-api`): Vitest with in-memory SQLite (`:memory:`), runs in parallel with web build
- **Frontend E2E** (`web`): Playwright with local file SQLite (`e2e-test.db` at monorepo root)
  - `globalSetup` runs `db:reset:e2e` (uses `apps/reports-api/.env.e2e`) to create fresh DB with migrations + seed data
  - `globalTeardown` deletes DB file (skip with `E2E_KEEP_DB=1`)
  - Three ordered phases: `smoke` (page loads) → `seeded-data` (registry/dashboard tests) → `data-mutation` (upload/delete tests)
  - Config: `apps/web/playwright.config.ts`

### Frontend Patterns

- API calls use `apiClient` from `@/shared/api/client` (base URL: `NEXT_PUBLIC_API_URL` env var, defaults to `http://localhost:3000`)
- UI: Radix UI + shadcn/ui, Tailwind CSS, `sonner` for toasts
- Delete buttons: `bg-red-600 hover:bg-red-700`
- Modals: shadcn Dialog (create/edit), AlertDialog (delete confirmation)
- Pagination: `usePagination` hook from `@/shared/hooks/use-pagination`

### Zod Response Schema Naming Convention

All Zod response schemas live in `packages/reports/src/{module}/schemas/{module}-response.schema.ts` and follow this naming pattern:

```
{modulePrefix}{EntityOrAction}{Schema|ArraySchema}
```

**Module prefixes** (camelCase abbreviation of the module name):
- `request-tags` → `requestTag`
- `application-registry` → `appRegistry`
- `request-categorization` → `reqCat`

**Schema naming rules:**

| Category | Pattern | Example |
|----------|---------|---------|
| Entity | `{prefix}{Entity}Schema` | `appRegistryApplicationSchema` |
| Entity array | `{prefix}{Entity}ArraySchema` | `appRegistryApplicationArraySchema` |
| Composed response | `{prefix}{Description}ResponseSchema` | `requestTagListResponseSchema` |
| Action result | `{prefix}{Action}ResultSchema` | `requestTagUploadResultSchema` |
| Delete result | `{prefix}DeleteResultSchema` | `requestTagDeleteResultSchema` |

**Type naming:** Same as schema name without `Schema` suffix → `RequestTagListResponse`, `AppRegistryDeleteResult`

**Frontend service pattern:** All services use `parseJsendData(zodSchema, raw)` for runtime validation:
```typescript
const raw = await apiClient.get<unknown>('/endpoint');
return parseJsendData(requestTagListResponseSchema, raw);
```

**Important:** After adding/modifying schemas in `@repo/reports`, run `pnpm --filter @repo/reports build` before running tests.

## Key Conventions

- Always use **pnpm**, never npm/yarn
- **Backend imports:** Use tsconfig path aliases (`@request-categorization/...`, `@tasks/...`), never relative paths. Aliases are defined in `apps/reports-api/tsconfig.json`.
- **Frontend imports:** Use `@/` alias (maps to `apps/web/`).
- Import shared types from `@repo/reports` for API-web type sharing
- Database DI token: `DATABASE_CONNECTION` (injected via `@Inject(DATABASE_CONNECTION)`)
- Repository interfaces define a Symbol token (e.g., `TASK_REPOSITORY`) for NestJS DI
- Swagger/OpenAPI available at `http://localhost:3000/api`
- `e2e` folder is excluded from Next.js tsconfig (`apps/web/tsconfig.json`)
