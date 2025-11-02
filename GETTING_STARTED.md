# Getting Started with TisOps Hub

## 🎯 Quick Start (5 minutes)

### 1. Prerequisites

```bash
# Check versions
node --version  # Should be 18+
pnpm --version  # Should be 8+
```

### 2. Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp apps/reports-api/.env.example apps/reports-api/.env
# Edit .env with your Turso credentials
```

### 3. Database Setup

```bash
# Apply migrations
pnpm db:migrate

# Verify database
pnpm db:studio  # Opens GUI at http://localhost:4983
```

### 4. Start Development

```bash
# Start both API and web app (uses Turbo)
pnpm dev
```

**URLs:**
- API: http://localhost:3000
- Web: http://localhost:3001
- Drizzle Studio: http://localhost:4983 (when running `pnpm db:studio`)

**Note:** `pnpm dev` runs `turbo run dev` which starts all apps in parallel with optimized caching.

## ✅ Verification Checklist

After starting the dev server, verify:

- [ ] API starts without errors
- [ ] Web app compiles successfully
- [ ] Can access http://localhost:3000 (should show "Hello World!")
- [ ] Can access http://localhost:3001 (shows homepage)
- [ ] Can access http://localhost:3001/tasks (shows Tasks page)
- [ ] API logs show all routes mapped:
  ```
  [RouterExplorer] Mapped {/tasks, POST} route
  [RouterExplorer] Mapped {/tasks, GET} route
  [RouterExplorer] Mapped {/tasks/:id, GET} route
  [RouterExplorer] Mapped {/tasks/:id, PATCH} route
  [RouterExplorer] Mapped {/tasks/:id, DELETE} route
  ```

## 🧪 Test the API

### Using curl (PowerShell)

```powershell
# Get all tasks
curl http://localhost:3000/tasks

# Create a task
curl -X POST http://localhost:3000/tasks `
  -H "Content-Type: application/json" `
  -d '{"title":"Test Task","description":"Testing the API","priority":"high"}'

# Get single task
curl http://localhost:3000/tasks/1

# Update task
curl -X PATCH http://localhost:3000/tasks/1 `
  -H "Content-Type: application/json" `
  -d '{"completed":true}'

# Delete task
curl -X DELETE http://localhost:3000/tasks/1
```

### Using Postman/Insomnia

Import the following collection:

**GET** `http://localhost:3000/tasks`
**POST** `http://localhost:3000/tasks`
```json
{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium"
}
```

## 📖 Next Steps

### 1. Understand the Architecture

Read these in order:
1. [`README.md`](./README.md) - Project overview
2. [`ARCHITECTURE_PLAN.md`](./ARCHITECTURE_PLAN.md) - Architecture overview
3. [`SHARED_DTO_PATTERN.md`](./SHARED_DTO_PATTERN.md) - Key pattern explained
4. [`CLEAN_ARCHITECTURE.md`](./CLEAN_ARCHITECTURE.md) - Detailed implementation

### 2. Explore the Codebase

**Start with the Tasks module** (complete reference implementation):

```
# Shared DTOs (what frontend and API share)
packages/reports/src/tasks/
├── dto/create-task.dto.ts       # ← Start here
├── dto/update-task.dto.ts
├── entities/task.entity.ts      # TypeScript interface
└── index.ts

# API Implementation (business logic)
apps/reports-api/src/tasks/
├── domain/entities/task.entity.ts        # ← Then here (domain entity)
├── application/use-cases/                # ← Business logic
├── infrastructure/repositories/          # ← Database access
├── tasks.controller.ts                   # ← HTTP endpoints
└── tasks.module.ts                       # ← NestJS wiring

# Frontend
apps/web/app/tasks/page.tsx               # ← UI component
```

### 3. Create Your First Module

Follow the guide in [`SHARED_DTO_PATTERN.md`](./SHARED_DTO_PATTERN.md#-checklist-for-new-module) to:
1. Create shared DTOs in `packages/reports/src/{module}/`
2. Create API module in `apps/reports-api/src/{module}/`
3. Add database schema and migrations
4. Test the endpoints

### 4. Common Commands

```bash
# Development (Turbo commands from root)
pnpm dev                              # Start all apps with Turbo
pnpm dev --filter=reports-api        # Start only API
pnpm dev --filter=web                # Start only web

# Building (Turbo commands from root)
pnpm build                            # Build everything with Turbo
pnpm build --filter=@repo/reports    # Build specific package

# Database (direct commands, run from root)
pnpm --filter=reports-api db:generate    # Create migration
pnpm --filter=reports-api db:migrate     # Apply migrations
pnpm --filter=reports-api db:studio      # Open GUI
pnpm --filter=reports-api db:reset       # ⚠️ Reset database

# Or use the shortcuts defined in root package.json
pnpm db:generate                      # Shortcut (if available)
pnpm db:migrate                       # Shortcut (if available)

# Testing (Turbo commands from root)
pnpm test                             # Run all tests with Turbo
pnpm test --filter=reports-api       # Test specific app
pnpm test:e2e                         # E2E tests with Turbo

# Code Quality (Turbo commands from root)
pnpm lint                             # Lint code with Turbo
pnpm format                           # Format code with Prettier
```

**Note:** Commands like `dev`, `build`, `test`, and `lint` use Turborepo under the hood for parallel execution and smart caching.

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process
```

### Database Issues

```bash
# Reset and recreate database
pnpm db:reset
pnpm db:migrate

# Verify schema in Drizzle Studio
pnpm db:studio
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

### Type Errors in Frontend

```bash
# Rebuild shared packages first
pnpm build --filter=@repo/reports
pnpm dev --filter=web
```

## 📝 Development Workflow

### Creating a New Feature

1. **Plan the module structure**
   - Decide on entity properties
   - Define DTOs needed
   - Plan use cases

2. **Create shared DTOs**
   ```bash
   # Create folder structure
   mkdir -p packages/reports/src/my-feature/{dto,entities}
   
   # Create files
   touch packages/reports/src/my-feature/dto/create-my-entity.dto.ts
   touch packages/reports/src/my-feature/entities/my-entity.entity.ts
   touch packages/reports/src/my-feature/index.ts
   
   # Export from entry.ts
   # Build package
   pnpm build --filter=@repo/reports
   ```

3. **Create database schema**
   ```bash
   # Create schema file
   touch apps/reports-api/src/database/infrastructure/schemas/my-entities.schema.ts
   
   # Generate migration
   pnpm db:generate
   
   # Apply migration
   pnpm db:migrate
   ```

4. **Create API module**
   ```bash
   # Create folder structure
   cd apps/reports-api/src
   mkdir -p my-feature/{domain/{entities,repositories},application/use-cases,infrastructure/repositories}
   
   # Create files following Clean Architecture pattern
   # (See CLEAN_ARCHITECTURE.md for details)
   ```

5. **Test and iterate**
   ```bash
   # Start dev server
   pnpm dev
   
   # Test endpoints with curl or Postman
   # Write unit tests
   pnpm test --filter=reports-api
   ```

## 🎓 Learning Resources

### Project Documentation
- [`README.md`](./README.md) - Main overview
- [`ARCHITECTURE_PLAN.md`](./ARCHITECTURE_PLAN.md) - Project roadmap
- [`CLEAN_ARCHITECTURE.md`](./CLEAN_ARCHITECTURE.md) - Architecture guide
- [`SHARED_DTO_PATTERN.md`](./SHARED_DTO_PATTERN.md) - Pattern reference
- [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) - Complete guidelines
- [`apps/reports-api/DATABASE_COMMANDS.md`](./apps/reports-api/DATABASE_COMMANDS.md) - Database guide

### External Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Turborepo Handbook](https://turbo.build/repo/docs)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## ✨ Tips for Success

1. **Always build shared packages first** before running apps
2. **Follow the Tasks module** as your reference implementation
3. **Use two entity definitions**: one shared interface, one domain class
4. **Read the error messages** - they're usually helpful
5. **Check Drizzle Studio** if you have database issues
6. **Keep business logic** in domain entities and use cases
7. **Share only contracts** (DTOs/types) via packages
8. **Test incrementally** - don't write everything at once

Happy coding! 🚀
