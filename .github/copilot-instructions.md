# TisOps Hub - AI Development Guidelines

## Project Architecture

This is a **Turborepo monorepo** containing a NestJS API and Next.js web app with shared packages. The project follows a strict workspace pattern where shared code lives in `packages/` and applications in `apps/`.

### Key Structure
- **apps/api**: NestJS backend (port 3000) with modular architecture
- **apps/web**: Next.js frontend (port 3001, Turbopack enabled)
- **packages/api**: Shared DTOs and entities exported for type safety
- **packages/ui**: Shared React components with `'use client'` directives
- **packages/eslint-config**: Centralized linting with Turbo plugin
- **packages/jest-config**: Environment-specific Jest configurations

## Development Workflows

### Package Manager & Commands
- **Always use `pnpm`** - This project uses pnpm workspaces
- **Root commands**: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`
- **Individual apps**: Use filters like `pnpm dev --filter=api` or `pnpm build --filter=web`
- **Dependency installation**: Run from root to maintain workspace integrity

### Build Dependencies
- **Build order matters**: Packages must build before apps (`turbo.json` handles this)
- **Shared packages auto-rebuild**: Use `pnpm build --watch` in packages during development
- **API port**: 3000, **Web port**: 3001 (hardcoded in web's fetch calls)

### Testing Patterns
- **API tests**: Jest with `nestConfig` (Node environment, `*.spec.ts` pattern)
- **E2E tests**: `pnpm test:e2e` uses separate Jest config
- **Coverage**: Automatically collected in `coverage/` directories

## Code Patterns & Conventions

### NestJS API Structure
- **Module pattern**: Each feature gets `module.ts`, `controller.ts`, `service.ts`, `*.spec.ts`
- **Shared types**: Export DTOs/entities from `packages/api/src/entry.ts`
- **CORS enabled**: `app.enableCors()` in `main.ts`
- **Example**: See `apps/api/src/links/` for the standard module structure

### Next.js Web Patterns
- **App Router**: Uses Next.js 15+ app directory structure
- **Turbopack**: Development server uses `--turbopack` for faster builds
- **Type imports**: Import types from `@repo/api` (e.g., `import type { Link } from '@repo/api'`)
- **API calls**: Hardcoded to `http://localhost:3000` with `cache: 'no-store'`

### Shared Component Guidelines
- **UI exports**: Components exported as `./src/*.tsx` in `packages/ui/package.json`
- **Client components**: Add `'use client'` directive for interactive components
- **Props pattern**: Components take `appName` prop for contextual behavior (see `Button`)

### Import Conventions
- **Workspace references**: Use `@repo/package-name` format
- **Type-only imports**: Use `import type { }` for better tree-shaking
- **Internal imports**: Relative paths within same package, workspace references across packages

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
- **API-Web communication**: Web app fetches from `localhost:3000/links` endpoint
- **Type sharing**: `packages/api` exports DTOs consumed by web app
- **Build pipeline**: Turbo ensures packages build before dependent apps
- **Development sync**: Run `pnpm dev` from root to start both API and web concurrently

## Key Files for Understanding
- `turbo.json`: Task dependencies and caching strategy
- `pnpm-workspace.yaml`: Package discovery and build constraints
- `packages/api/src/entry.ts`: Shared type exports
- `apps/api/src/links/`: Example of standard NestJS module pattern