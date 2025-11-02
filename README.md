# TisOps Hub

A modern monorepo application built with Turborepo, following Clean Architecture and Domain-Driven Design (DDD) principles.

## 🏗️ Project Structure

This Turborepo includes the following packages & apps:

### Apps and Packages

```shell
.
├── apps
│   ├── reports-api              # NestJS API with Clean Architecture (port 3000)
│   └── web                      # Next.js frontend with App Router (port 3001)
└── packages
    ├── @repo/reports            # Shared DTOs and TypeScript types
    ├── @repo/ui                 # Shared React components
    ├── @repo/eslint-config      # ESLint configurations (includes Prettier)
    ├── @repo/jest-config        # Jest configurations
    └── @repo/typescript-config  # TypeScript configurations
```

### Current Features

- ✅ **Tasks Module**: Complete reference implementation with Clean Architecture
  - Domain entities with business logic
  - Use cases for application logic
  - Repository pattern with Drizzle ORM
  - Shared DTOs via `@repo/reports`

### Planned Features

- 🔜 **Belcorp Reports**: Weekly and monthly reports
- 🔜 **Report Templates**: Reusable report configurations
- 🔜 **Data Sources**: Belcorp data integration

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com) (Backend) + [Next.js 15](https://nextjs.org) (Frontend)
- **Database**: [Turso](https://turso.tech) (SQLite cloud)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Package Manager**: [pnpm](https://pnpm.io)
- **Monorepo**: [Turborepo](https://turbo.build/repo)

### Development Tools

- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Jest](https://jestjs.io/) for testing
- [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for database migrations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Setup environment variables
cp apps/reports-api/.env.example apps/reports-api/.env
# Edit .env with your Turso credentials
```

### Database Setup

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (optional)
pnpm db:studio
```

## 📋 Commands

### Development

```bash
# Start all apps in development mode (uses Turbo)
pnpm dev

# Start specific app
pnpm dev --filter=reports-api
pnpm dev --filter=web
```

### Build

```bash
# Build all apps and packages (uses Turbo)
pnpm build

# Build specific package
pnpm build --filter=@repo/reports
```

### Testing

```bash
# Run all tests (uses Turbo)
pnpm test

# Run e2e tests (uses Turbo)
pnpm test:e2e

# Run tests with coverage
pnpm test -- --coverage
```

### Database

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (development only)
pnpm db:push

# Open Drizzle Studio GUI
pnpm db:studio

# Reset database (⚠️ destructive)
pnpm db:reset
```

### Code Quality

```bash
# Lint all code (uses Turbo)
pnpm lint

# Format code with Prettier
pnpm format
```

**Note:** Commands like `dev`, `build`, `test`, and `lint` use **Turborepo** for parallel execution, smart caching, and optimized builds.

## 📖 Documentation

- [`ARCHITECTURE_PLAN.md`](./ARCHITECTURE_PLAN.md) - Project architecture overview
- [`CLEAN_ARCHITECTURE.md`](./CLEAN_ARCHITECTURE.md) - Clean Architecture implementation guide
- [`SHARED_DTO_PATTERN.md`](./SHARED_DTO_PATTERN.md) - Quick reference for shared DTO pattern
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) - Complete development guidelines
- [`apps/reports-api/DATABASE_COMMANDS.md`](./apps/reports-api/DATABASE_COMMANDS.md) - Database workflow guide

## 🏛️ Architecture Highlights

### Clean Architecture in API

Each feature module follows three-layer architecture:
- **Domain**: Pure business logic (entities, value objects, repository interfaces)
- **Application**: Use cases and application-specific logic
- **Infrastructure**: Technical implementations (repositories, controllers, modules)

### Shared DTO Pattern

- **`packages/reports/src/{module}/`**: Shared DTOs and TypeScript types
- **`apps/reports-api/src/{module}/`**: Business logic with Clean Architecture
- Both API and frontend import from `@repo/reports` for type safety

### Example: Tasks Module

```typescript
// Frontend imports shared types
import type { Task } from '@repo/reports';

// API controller imports shared DTOs
import { CreateTaskDto } from '@repo/reports';

// Use cases use domain entities (internal)
import { Task } from './domain/entities/task.entity';
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Follow the Clean Architecture pattern (see documentation)
3. Create both shared DTOs and domain entities
4. Write tests for use cases
5. Update documentation if needed

## 📝 License

[MIT](./LICENSE)

```bash
# Will format all the supported `.ts,.js,json,.tsx,.jsx` files.
# See `@repo/eslint-config/prettier-base.js` to customize the behavior.
pnpm format
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```bash
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```bash
npx turbo link
```

## Useful Links

This example take some inspiration the [with-nextjs](https://github.com/vercel/turborepo/tree/main/examples/with-nextjs) `Turbo` example and [01-cats-app](https://github.com/nestjs/nest/tree/master/sample/01-cats-app) `NestJs` sample.

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
