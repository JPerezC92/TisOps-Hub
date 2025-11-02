# TisOps Hub - Clean Architecture Plan

## Overview

This document outlines the implementation plan for transforming TisOps Hub into a clean architecture monorepo with domain-driven design principles. The architecture currently supports:

- **Tasks Management System**: Starter example implementing full clean architecture (✅ Implemented)
- **Belcorp Reports System**: Business intelligence and reporting for Belcorp operations (🔜 Future)
- **Shared DTOs**: Type-safe contracts between database, API, and frontend
- **Turso Database**: SQLite-compatible edge database with global replication

## Architecture Principles

### Core Principles
- **Domain-Driven Design (DDD)** with hexagonal architecture
- **Shared contracts** between all layers
- **Strict dependency inversion** (dependencies flow inward toward domain)
- **Database agnostic** business logic
- **Pure domain logic** without external dependencies
- **Type safety** across all layers

### Dependency Flow
```
Frontend (Web) ←→ Contracts ←→ Use Cases ←→ Domain
                     ↑              ↑
                   API            Infrastructure
                (Controllers)    (Repositories)
```

## Proposed Folder Structure

### Current Implementation (✅ Completed)

```
TisOps Hub/
├── apps/
│   ├── reports-api/                  # NestJS API (Port 3000)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── database/            # Database infrastructure (Turso + Drizzle)
│   │   │   │   └── infrastructure/
│   │   │   │       ├── database.config.ts
│   │   │   │       ├── database.module.ts
│   │   │   │       ├── schemas/     # All Drizzle schemas
│   │   │   │       │   ├── tasks.schema.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── migrations/  # SQL migration files
│   │   │   └── tasks/               # ✅ STARTER EXAMPLE - Full Clean Architecture
│   │   │       ├── domain/          # Business Logic Layer
│   │   │       │   ├── entities/
│   │   │       │   │   └── task.entity.ts
│   │   │       │   └── repositories/
│   │   │       │       └── task.repository.interface.ts
│   │   │       ├── application/     # Use Cases Layer
│   │   │       │   └── use-cases/
│   │   │       │       ├── get-all-tasks.use-case.ts
│   │   │       │       ├── get-task-by-id.use-case.ts
│   │   │       │       ├── create-task.use-case.ts
│   │   │       │       ├── update-task.use-case.ts
│   │   │       │       └── delete-task.use-case.ts
│   │   │       ├── infrastructure/  # Technical Implementation
│   │   │       │   └── repositories/
│   │   │       │       └── task.repository.ts
│   │   │       ├── tasks.module.ts  # NestJS module with factory providers
│   │   │       ├── tasks.service.ts # Orchestrates use cases
│   │   │       └── tasks.controller.ts
│   │   └── package.json
│   │
│   └── web/                          # Next.js App (Port 3001)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── components/
│       │   │   └── Navigation.tsx   # Site navigation
│       │   └── tasks/               # ✅ Tasks UI
│       │       └── page.tsx
│       └── package.json
│
├── packages/
│   ├── reports/                      # ✅ Shared DTOs (currently for tasks)
│   │   └── src/
│   │       └── entry.ts             # Exports task DTOs and entities
│   ├── ui/                          # ✅ Shared UI components
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── code.tsx
│   ├── eslint-config/               # ✅ Centralized linting
│   ├── jest-config/                 # ✅ Test configurations
│   └── typescript-config/           # ✅ Shared tsconfig
```

### Future Implementation (🔜 Planned)

**Belcorp Reports System** - Following the same clean architecture pattern as Tasks:

```
apps/reports-api/src/
├── belcorp-reports/                 # 🔜 Belcorp Reports Feature Module
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── weekly-report.entity.ts
│   │   │   ├── monthly-report.entity.ts
│   │   │   └── index.ts
│   │   └── repositories/
│   │       ├── weekly-report.repository.interface.ts
│   │       ├── monthly-report.repository.interface.ts
│   │       └── index.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── weekly/
│   │       │   ├── generate-weekly-report.use-case.ts
│   │       │   ├── get-weekly-report.use-case.ts
│   │       │   └── list-weekly-reports.use-case.ts
│   │       └── monthly/
│   │           ├── generate-monthly-report.use-case.ts
│   │           ├── get-monthly-report.use-case.ts
│   │           └── list-monthly-reports.use-case.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       ├── weekly-report.repository.ts
│   │       └── monthly-report.repository.ts
│   ├── belcorp-reports.module.ts
│   ├── belcorp-reports.service.ts
│   └── belcorp-reports.controller.ts
│
├── templates/                       # 🔜 Report Templates Module
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── template.entity.ts
│   │   │   ├── template-section.entity.ts
│   │   │   └── index.ts
│   │   └── repositories/
│   │       └── template.repository.interface.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── create-template.use-case.ts
│   │       ├── clone-template.use-case.ts
│   │       ├── get-template.use-case.ts
│   │       └── list-templates.use-case.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── template.repository.ts
│   ├── templates.module.ts
│   ├── templates.service.ts
│   └── templates.controller.ts
│
└── data-sources/                    # 🔜 Data Sources Module
    ├── domain/
    │   ├── entities/
    │   │   ├── data-source.entity.ts
    │   │   ├── connection.entity.ts
    │   │   └── index.ts
    │   └── repositories/
    │       └── data-source.repository.interface.ts
    ├── application/
    │   └── use-cases/
    │       ├── create-data-source.use-case.ts
    │       ├── test-connection.use-case.ts
    │       ├── get-data-source.use-case.ts
    │       └── list-data-sources.use-case.ts
    ├── infrastructure/
    │   └── repositories/
    │       └── data-source.repository.ts
    ├── data-sources.module.ts
    ├── data-sources.service.ts
    └── data-sources.controller.ts

apps/web/app/
├── belcorp-reports/                 # 🔜 Belcorp Reports UI
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── builder/
│       └── page.tsx
├── templates/                       # 🔜 Templates UI
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── new/
│       └── page.tsx
└── data-sources/                    # 🔜 Data Sources UI
    ├── page.tsx
    ├── [id]/
    │   └── page.tsx
    └── new/
        └── page.tsx

packages/
├── shared/                          # 🔜 Shared domain logic
│   └── src/
│       ├── value-objects/
│       ├── interfaces/
│       ├── exceptions/
│       └── types/
└── reports/                         # 🔜 Restructure for Belcorp Reports
    └── src/
        ├── belcorp-weekly/
        │   ├── dto/
        │   └── entities/
        ├── belcorp-monthly/
        │   ├── dto/
        │   └── entities/
        ├── templates/
        │   ├── dto/
        │   └── entities/
        └── data-sources/
            ├── dto/
            └── entities/
```

## Implementation Plan

### ✅ Phase 1: Foundation Setup (Completed)
1. **Create Tasks Module as Starter** ✅
   - [x] Set up clean architecture structure (Domain/Application/Infrastructure)
   - [x] Create Task entity with business rules
   - [x] Define repository interface (ITaskRepository)
   - [x] Implement CRUD use cases as pure TypeScript classes
   - [x] Create Drizzle repository implementation
   - [x] Wire up NestJS module with factory providers
   - [x] Build REST API endpoints
   - [x] Create Next.js UI for tasks

2. **Setup Database Infrastructure** ✅
   - [x] Configure Turso database connection
   - [x] Implement Drizzle ORM with SQLite dialect
   - [x] Create database module (infrastructure only)
   - [x] Setup migrations with drizzle-kit
   - [x] Document database commands

3. **Documentation** ✅
   - [x] Create comprehensive CLEAN_ARCHITECTURE.md guide
   - [x] Document database workflows (DATABASE_COMMANDS.md)
   - [x] Update Copilot instructions with patterns
   - [x] Create Navigation component for web app

### 🔜 Phase 2: Belcorp Reports System (Future)
4. **Implement Belcorp Reports Module**
   - [ ] Create belcorp-reports module following Tasks pattern
   - [ ] Implement weekly reports (domain/application/infrastructure)
   - [ ] Implement monthly reports (domain/application/infrastructure)
   - [ ] Add report generation services
   - [ ] Create schemas for reports tables
   - [ ] Build REST API endpoints
   - [ ] Implement UI for reports management

5. **Implement Templates Module**
   - [ ] Create templates module following Tasks pattern
   - [ ] Define template entity and value objects
   - [ ] Implement template management use cases
   - [ ] Add template validation services
   - [ ] Create schemas for templates tables
   - [ ] Build REST API endpoints
   - [ ] Implement UI for template builder

6. **Implement Data Sources Module**
   - [ ] Create data-sources module following Tasks pattern
   - [ ] Define data source entity and connection logic
   - [ ] Implement connection testing use cases
   - [ ] Add Turso connection integration
   - [ ] Create schemas for data sources tables
   - [ ] Build REST API endpoints
   - [ ] Implement UI for data source management

### 🔜 Phase 3: Advanced Features (Future)
7. **Report Generation Engine**
   - [ ] Implement PDF generation service
   - [ ] Add Excel export functionality
   - [ ] Create chart generation service
   - [ ] Integrate with templates system

8. **Shared Package Restructuring**
   - [ ] Create @repo/shared package
   - [ ] Restructure @repo/reports by sub-domain
   - [ ] Extract common value objects
   - [ ] Define base interfaces for all modules

9. **Testing & Quality**
   - [ ] Add comprehensive unit tests for use cases
   - [ ] Create integration tests for repositories
   - [ ] Implement E2E tests for API endpoints
   - [ ] Add UI component tests

10. **Performance & Scalability**
    - [ ] Implement caching strategies
    - [ ] Add pagination everywhere
    - [ ] Optimize database queries
    - [ ] Set up monitoring and logging

## Current Architecture Pattern (Reference for Future Modules)

All new modules should follow the **Tasks Module** pattern documented in `CLEAN_ARCHITECTURE.md`:

### Three-Layer Structure
1. **Domain Layer** (`domain/`)
   - Pure TypeScript entities with business logic
   - Repository interfaces (ports)
   - No external dependencies

2. **Application Layer** (`application/use-cases/`)
   - Pure TypeScript use case classes (no decorators)
   - Orchestrate business logic
   - Depend only on domain layer

3. **Infrastructure Layer** (`infrastructure/`)
   - Repository implementations (Drizzle ORM)
   - NestJS module with factory providers
   - Service orchestrators
   - HTTP controllers

### Database Organization
- **Database module** = Infrastructure only (connection + all schemas)
- **Feature modules** = Own their domain/application/infrastructure
- **Schemas** = Centralized in `database/infrastructure/schemas/`
- **Migrations** = Managed by drizzle-kit in `database/infrastructure/migrations/`

## Database Configuration Strategy with Drizzle

### Current Drizzle Setup ✅
```
apps/reports-api/src/
└── database/infrastructure/
    ├── database.config.ts          # Turso connection
    ├── database.module.ts          # Global DATABASE_CONNECTION export
    ├── schemas/                    # All Drizzle schemas
    │   ├── tasks.schema.ts         # ✅ Implemented
    │   ├── index.ts
    │   └── [future-tables].schema.ts  # 🔜 Add here
    └── migrations/                 # SQL migration files
        ├── 0000_same_vampiro.sql
        └── 0001_simple_princess_powerful.sql
```

### Database Commands
- `pnpm db:push` - Push schema changes (development)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Apply migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:reset` - Reset database (⚠️ destructive)

### Future Schemas (🔜 To Add)
When implementing Belcorp Reports, add these schemas to `database/infrastructure/schemas/`:
- `weekly-reports.schema.ts`
- `monthly-reports.schema.ts`
- `templates.schema.ts`
- `template-sections.schema.ts`
- `data-sources.schema.ts`
- `connections.schema.ts`

## Technology Stack

### Backend ✅
- **Framework**: NestJS
- **Database**: Turso (SQLite edge database)
- **ORM**: Drizzle ORM with drizzle-kit
- **Validation**: class-validator + class-transformer
- **Authentication**: JWT (🔜 Future)

### Frontend ✅
- **Framework**: Next.js 15+ with App Router
- **Styling**: CSS Modules
- **HTTP Client**: Fetch API
- **Port**: 3001 (Turbopack enabled)

### Shared ✅
- **Package Manager**: pnpm
- **Build Tool**: Turborepo
- **Type System**: TypeScript
- **Testing**: Jest + Testing Library
- **Linting**: ESLint + Prettier

## Package Dependencies

```json
// Current implementation
{
  "@repo/reports": "workspace:*",     // ✅ Shared DTOs
  "@repo/ui": "workspace:*",          // ✅ Shared components
  "@libsql/client": "^0.14.0",        // ✅ Turso client
  "drizzle-orm": "^0.36.4",           // ✅ ORM
  "drizzle-kit": "^0.30.1"            // ✅ Migrations
}

// Future additions for Belcorp Reports
{
  "@repo/shared": "workspace:*",      // 🔜 Common domain logic
  "puppeteer": "^21.0.0",             // 🔜 PDF generation
  "exceljs": "^4.4.0",                // 🔜 Excel export
  "chart.js": "^4.4.0"                // 🔜 Chart generation
}
```

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Pure domain logic can be tested without external dependencies
3. **Flexibility**: Easy to swap implementations (database, UI framework, etc.)
4. **Type Safety**: Shared contracts ensure consistency across all layers
5. **Scalability**: Easy to add new features following established patterns
6. **Maintainability**: Changes in one layer don't affect others
7. **Team Collaboration**: Clear boundaries enable parallel development

## Migration Strategy

### From Current State
1. Keep existing structure working
2. Create new packages alongside existing code
3. Gradually migrate features to new architecture
4. Remove old code once new implementation is stable
5. Update tests and documentation

### Testing Strategy
- **Unit Tests**: Domain entities and use cases
- **Integration Tests**: Repository implementations
- **E2E Tests**: API endpoints and user flows
- **Contract Tests**: Ensure DTOs are consistent across layers

## Next Steps

### ✅ Completed Foundation
1. ~~Create Tasks module as starter example~~ **DONE**
2. ~~Setup Turso database with Drizzle ORM~~ **DONE**
3. ~~Implement clean architecture (Domain/Application/Infrastructure)~~ **DONE**
4. ~~Create comprehensive documentation~~ **DONE** (see `CLEAN_ARCHITECTURE.md`)
5. ~~Build working API + UI~~ **DONE**

### 🔜 Next Priorities
1. **Implement Belcorp Reports Module**
   - Follow the Tasks module pattern documented in `CLEAN_ARCHITECTURE.md`
   - Create weekly-reports domain/application/infrastructure
   - Add report schemas to `database/infrastructure/schemas/`
   - Build REST API endpoints
   - Implement UI

2. **Add Templates Module**
   - Follow clean architecture pattern
   - Create template management use cases
   - Integrate with reports system

3. **Add Data Sources Module**
   - Implement connection management
   - Add Turso connection testing
   - Create data source configuration UI

4. **Refine and Scale**
   - Extract common patterns to @repo/shared
   - Add comprehensive testing
   - Implement caching and optimization
   - Setup CI/CD pipeline

---

**Reference Documents:**
- `CLEAN_ARCHITECTURE.md` - Detailed guide for implementing new modules following Tasks pattern
- `DATABASE_COMMANDS.md` - Complete database workflow and commands reference
- `.github/copilot-instructions.md` - AI development guidelines and patterns

*This document is a living plan that will be updated as we implement and learn.*