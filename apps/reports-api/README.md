# Reports API

NestJS API following Clean Architecture and Domain-Driven Design principles.

## 🚀 Getting Started

### Development Server

```bash
# From root
pnpm dev --filter=reports-api

# Or from this directory
pnpm dev
```

By default, your server will run at [localhost:3000](http://localhost:3000).

### Available Endpoints

- `GET /` - Health check
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task by ID
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

You can test the APIs using [Insomnia](https://insomnia.rest/), [Postman](https://www.postman.com/), or [Thunder Client](https://www.thunderclient.com/).

## 🏗️ Architecture

This API follows **Clean Architecture** with three layers:

### Domain Layer (Business Logic)
- Pure TypeScript entities with business rules
- Repository interfaces (ports)
- Value objects

### Application Layer (Use Cases)
- Application-specific business logic
- Pure TypeScript classes (no decorators)
- Orchestrates domain entities

### Infrastructure Layer (Technical Details)
- NestJS controllers and modules
- Repository implementations with Drizzle ORM
- Database schemas and migrations

See [`CLEAN_ARCHITECTURE.md`](../../CLEAN_ARCHITECTURE.md) for detailed implementation guide.

## 📦 Shared Types

DTOs and TypeScript types are exported from `@repo/reports` package:

```typescript
import { CreateTaskDto, UpdateTaskDto } from '@repo/reports';
import type { Task } from '@repo/reports';
```

This enables type safety across the entire monorepo.

## 🗄️ Database

### Commands

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio

# Reset database (⚠️ destructive)
pnpm db:reset
```

See [`DATABASE_COMMANDS.md`](./DATABASE_COMMANDS.md) for comprehensive database workflow guide.

### Technology

- **Database**: Turso (SQLite cloud)
- **ORM**: Drizzle ORM
- **Migrations**: drizzle-kit

## 🧪 Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com) - Progressive Node.js framework
- [NestJS Courses](https://courses.nestjs.com) - Official courses
- [Clean Architecture Guide](../../CLEAN_ARCHITECTURE.md) - Project-specific implementation
