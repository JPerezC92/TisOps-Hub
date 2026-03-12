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

**Turborepo monorepo** with pnpm workspaces. Two apps, four shared packages.

### Apps

- **`apps/reports-api`** — NestJS backend (port 3000). Each module follows **Clean Architecture**: `domain/` (entities, repository interfaces) → `application/` (use cases) → `infrastructure/` (Drizzle repos, NestJS module/controller). Dependencies point inward.
- **`apps/web`** — Next.js 16 frontend (port 3001, Turbopack). App Router with `app/` pages. Feature code lives in `modules/{feature}/` with components, hooks, and services.

### Packages

- **`@repo/database`** — Drizzle ORM schemas and Turso config. All table schemas defined here in `src/schemas/`. Shared by API.
- **`@repo/reports`** — Shared DTOs and TypeScript types between API and web. Contains Zod validation schemas, `createZodDto()` classes, and entity interfaces. **No business logic** — only data contracts.
- **`@repo/ui`** — Shared React components (shadcn/ui pattern).
- **`@repo/eslint-config`**, **`@repo/typescript-config`**, **`@repo/vitest-config`** — Shared tooling configs.

### API Module Structure

```
apps/reports-api/src/{module}/
├── domain/
│   ├── entities/          # Domain entities with business logic
│   └── repositories/      # Repository interfaces (ports) with Symbol tokens
├── application/
│   └── use-cases/         # Pure TS classes, no framework decorators
└── infrastructure/
    ├── repositories/      # Drizzle ORM implementations
    └── module.ts          # NestJS module with factory providers
```

Use cases are wired via factory providers injecting repository interfaces:
```typescript
{ provide: CreateTaskUseCase, useFactory: (repo) => new CreateTaskUseCase(repo), inject: [TASK_REPOSITORY] }
```

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

- API calls go to `http://localhost:3000` (hardcoded)
- UI: Radix UI + shadcn/ui, Tailwind CSS, `sonner` for toasts
- Delete buttons: `bg-red-600 hover:bg-red-700`
- Modals: shadcn Dialog (create/edit), AlertDialog (delete confirmation)
- Pagination: `usePagination` hook from `@/shared/hooks/use-pagination`

## Key Conventions

- Always use **pnpm**, never npm/yarn
- Import types from `@repo/reports` for API-web type sharing
- Database DI token: `DATABASE_CONNECTION` (injected via `@Inject(DATABASE_CONNECTION)`)
- Repository interfaces define a Symbol token (e.g., `TASK_REPOSITORY`) for NestJS DI
- Swagger/OpenAPI available at `http://localhost:3000/api`
- `e2e` folder is excluded from Next.js tsconfig (`apps/web/tsconfig.json`)
