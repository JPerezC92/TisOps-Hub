# TisOps Hub - Clean Architecture Plan

## Overview

This document outlines the implementation plan for transforming TisOps Hub into a clean architecture monorepo with domain-driven design principles. The architecture currently supports:

- **Tasks Management System**: Starter example implementing full clean architecture (✅ Implemented)
- **File Import Features**: Excel file processing and data transformation (✅ Implemented)
  - Request Categorization (Error categorization reports)
  - Parent-Child Requests (Request relationships)
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
│   │   │   ├── tasks/               # ✅ STARTER EXAMPLE - Full Clean Architecture
│   │   │   │   ├── domain/          # Business Logic Layer
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── task.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── task.repository.interface.ts
│   │   │   │   ├── application/     # Use Cases Layer
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── get-all-tasks.use-case.ts
│   │   │   │   │       ├── get-task-by-id.use-case.ts
│   │   │   │   │       ├── create-task.use-case.ts
│   │   │   │   │       ├── update-task.use-case.ts
│   │   │   │   │       └── delete-task.use-case.ts
│   │   │   │   ├── infrastructure/  # Technical Implementation
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── task.repository.ts
│   │   │   │   ├── tasks.module.ts  # NestJS module with factory providers
│   │   │   │   ├── tasks.service.ts # Orchestrates use cases
│   │   │   │   └── tasks.controller.ts
│   │   │   ├── request-categorization/  # ✅ File Import Feature - Error Categorization
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── request-categorization.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── request-categorization.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── get-all.use-case.ts
│   │   │   │   │       ├── delete-all.use-case.ts
│   │   │   │   │       ├── create-many.use-case.ts
│   │   │   │   │       └── get-category-summary.use-case.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── request-categorization.repository.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── excel-parser.service.ts  # Excel parsing logic
│   │   │   │   ├── request-categorization.module.ts
│   │   │   │   ├── request-categorization.service.ts
│   │   │   │   └── request-categorization.controller.ts
│   │   │   ├── parent-child-requests/   # ✅ File Import Feature - Request Relationships
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── parent-child-request.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── parent-child-request.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── get-all.use-case.ts
│   │   │   │   │       ├── get-stats.use-case.ts
│   │   │   │   │       ├── create-many.use-case.ts
│   │   │   │   │       └── delete-all.use-case.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   │   └── parent-child-request.repository.ts
│   │   │   │   │   └── services/
│   │   │   │   │       └── excel-parser.service.ts  # Excel parsing logic
│   │   │   │   ├── parent-child-requests.module.ts
│   │   │   │   ├── parent-child-requests.service.ts
│   │   │   │   └── parent-child-requests.controller.ts
│   │   │   ├── request-tags/        # ✅ Request Tags Module - Excel Import (REP01)
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── request-tag.entity.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── request-tag.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── get-all-request-tags.use-case.ts
│   │   │   │   │       ├── create-request-tag.use-case.ts
│   │   │   │   │       ├── delete-all-request-tags.use-case.ts
│   │   │   │   │       ├── import-request-tags.use-case.ts
│   │   │   │   │       ├── get-missing-ids-by-linked-request.use-case.ts
│   │   │   │   │       └── get-request-ids-by-additional-info.use-case.ts
│   │   │   │   ├── infrastructure/
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── request-tag.repository.ts
│   │   │   │   ├── request-tags.module.ts
│   │   │   │   ├── request-tags.service.ts
│   │   │   │   └── request-tags.controller.ts
│   │   │   └── error-logs/          # ✅ System-wide Error Tracking
│   │   │       ├── domain/
│   │   │       │   ├── entities/
│   │   │       │   │   └── error-log.entity.ts
│   │   │       │   └── repositories/
│   │   │       │       └── error-log.repository.interface.ts
│   │   │       ├── application/
│   │   │       │   └── use-cases/
│   │   │       │       ├── get-all-error-logs.use-case.ts
│   │   │       │       ├── get-error-log-by-id.use-case.ts
│   │   │       │       └── log-error.use-case.ts
│   │   │       ├── infrastructure/
│   │   │       │   └── repositories/
│   │   │       │       └── error-log.repository.ts
│   │   │       ├── error-logs.module.ts
│   │   │       ├── error-logs.service.ts
│   │   │       └── error-logs.controller.ts
│   │   └── package.json
│   │
│   └── web/                          # Next.js App (Port 3001)
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── globals.css          # Global styling with Tailwind CSS
│       │   ├── components/
│       │   │   └── Navigation.tsx   # Site navigation
│       │   ├── tasks/               # ✅ Tasks UI
│       │   │   └── page.tsx
│       │   ├── error-categorization/  # ✅ Error Categorization UI
│       │   │   └── page.tsx
│       │   ├── request-relationships/  # ✅ Request Relationships UI
│       │   │   └── page.tsx
│       │   ├── request-tags/        # ✅ Request Tags UI
│       │   │   └── page.tsx
│       │   ├── error-logs/          # ✅ Error Logs Dashboard
│       │   │   └── page.tsx
│       │   ├── imports/             # ✅ Unified Imports Page
│       │   │   └── page.tsx
│       │   └── reports/             # ✅ Reports Dashboard
│       │       └── page.tsx
│       └── package.json
│
├── packages/
│   ├── reports/                      # ✅ Shared DTOs
│   │   └── src/
│   │       ├── tasks/                # Task DTOs
│   │       ├── request-categorization/  # Error categorization DTOs
│   │       ├── parent-child-requests/   # Request relationships DTOs
│   │       ├── request-tags/         # Request tags DTOs
│   │       └── entry.ts             # Exports all DTOs and entities
│   ├── database/                    # ✅ Centralized Database Package
│   │   └── src/
│   │       ├── config.ts            # Turso connection and DATABASE_CONNECTION export
│   │       ├── schemas/             # All Drizzle schemas
│   │       │   ├── tasks.schema.ts
│   │       │   ├── request-categorization.schema.ts
│   │       │   ├── parent-child-requests.schema.ts
│   │       │   ├── request-tags.schema.ts
│   │       │   ├── error-logs.schema.ts
│   │       │   └── index.ts
│   │       └── entry.ts             # Central export file
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
└── data-sources/                    # 🔜 Data Sources Module (Connection Management)
    ├── domain/
    │   ├── entities/
    │   │   ├── data-source.entity.ts     # Database connection configuration
    │   │   ├── connection.entity.ts      # Connection state & health
    │   │   └── index.ts
    │   └── repositories/
    │       └── data-source.repository.interface.ts
    ├── application/
    │   └── use-cases/
    │       ├── create-data-source.use-case.ts     # Save connection config
    │       ├── test-connection.use-case.ts        # Verify connection health
    │       ├── get-data-source.use-case.ts
    │       └── list-data-sources.use-case.ts
    ├── infrastructure/
    │   └── repositories/
    │       └── data-source.repository.ts
    ├── data-sources.module.ts
    ├── data-sources.service.ts
    └── data-sources.controller.ts

# NOTE: Data Sources Module is for CONNECTION MANAGEMENT (database configs, credentials, health checks),
# NOT for file import/processing. File imports are independent feature modules (like request-categorization).

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
   - [x] Centralize database schemas into `@repo/database` package
   - [x] Setup migrations with drizzle-kit
   - [x] Document database commands

3. **Documentation** ✅
   - [x] Create comprehensive CLEAN_ARCHITECTURE.md guide
   - [x] Document database workflows (DATABASE_COMMANDS.md)
   - [x] Update Copilot instructions with patterns
   - [x] Create Navigation component for web app
   - [x] Migrate to Tailwind CSS and establish design system

4. **File Import Features** ✅
   - [x] Request Categorization Module (Error categorization reports)
     - [x] Excel parser service with XLSX library
     - [x] Domain entities with business logic
     - [x] Use cases for batch operations
     - [x] Category summary aggregation
     - [x] Frontend UI with Tailwind design
   - [x] Parent-Child Requests Module (Request relationships)
     - [x] Excel parser service for relationship data
     - [x] Domain entities for request relationships
     - [x] Statistics and summary use cases
     - [x] Frontend UI with relationship visualization

5. **Request Tags Module** ✅
   - [x] Implement clean architecture structure
   - [x] Excel import with file upload endpoint
   - [x] Domain entities for tag management
   - [x] Use cases: get-all, create, delete-all, import, query operations
   - [x] Repository implementation with Drizzle ORM
   - [x] Frontend UI for tag management and imports
   - [x] Query endpoints for missing IDs and additional info search

6. **Error Logging System** ✅
   - [x] System-wide error tracking module
   - [x] Clean architecture implementation
   - [x] Use cases for logging and retrieving errors
   - [x] Database exception filter integration
   - [x] Frontend error logs dashboard
   - [x] Error aggregation and filtering capabilities

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
   - [ ] Define data source entity (connection configs, credentials)
   - [ ] Implement connection testing use cases
   - [ ] Add database connection health checks (Turso, MySQL, PostgreSQL, etc.)
   - [ ] Create schemas for data sources tables
   - [ ] Build REST API endpoints
   - [ ] Implement UI for data source management
   - **Note**: This module is for CONNECTION MANAGEMENT, not file import processing

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
- **Database package** (`@repo/database`) = Centralized connection and all Drizzle schemas
- **Feature modules** = Own their domain/application/infrastructure
- **Schemas** = Centralized in `packages/database/src/schemas/`
- **Migrations** = Managed by drizzle-kit in `apps/reports-api/src/database/infrastructure/migrations/`

## Database Configuration Strategy with Drizzle

### Current Drizzle Setup ✅
```
packages/
└── database/                       # ✅ Centralized Database Package
    └── src/
        ├── config.ts               # Turso connection and DATABASE_CONNECTION export
        ├── schemas/                # All Drizzle schemas
        │   ├── tasks.schema.ts    # ✅ Implemented
        │   ├── request-categorization.schema.ts  # ✅ Implemented
        │   ├── parent-child-requests.schema.ts   # ✅ Implemented
        │   ├── request-tags.schema.ts            # ✅ Implemented
        │   ├── error-logs.schema.ts              # ✅ Implemented
        │   ├── index.ts
        │   └── [future-tables].schema.ts  # 🔜 Add here
        └── entry.ts                # Central export file

apps/reports-api/src/
└── database/infrastructure/
    └── migrations/                 # SQL migration files
        ├── 0000_same_vampiro.sql
        └── 0001_simple_princess_powerful.sql
```

**Note:** Database schemas have been centralized into the `@repo/database` package for better code organization and reusability across the monorepo.

### Database Commands
- `pnpm db:push` - Push schema changes (development)
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Apply migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:reset` - Reset database (⚠️ destructive)

### Future Schemas (🔜 To Add)
When implementing Belcorp Reports, add these schemas to `packages/database/src/schemas/`:
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
6. ~~Implement File Import Features~~ **DONE**
   - ~~Request Categorization (Error categorization reports with Excel parsing)~~ **DONE**
   - ~~Parent-Child Requests (Request relationships with Excel parsing)~~ **DONE**
7. ~~Centralize database schemas into `@repo/database` package~~ **DONE**
8. ~~Implement Request Tags Module (REP01)~~ **DONE**
9. ~~Implement Error Logging System~~ **DONE**
10. ~~Migrate to Tailwind CSS~~ **DONE**

### 🔜 Next Priorities
1. **Implement Belcorp Reports Module**
   - Follow the Tasks module pattern documented in `CLEAN_ARCHITECTURE.md`
   - Create weekly-reports domain/application/infrastructure
   - Add report schemas to `packages/database/src/schemas/`
   - Build REST API endpoints
   - Implement UI

2. **Add Templates Module**
   - Follow clean architecture pattern
   - Create template management use cases
   - Integrate with reports system

3. **Add Data Sources Module** (Connection Management)
   - Implement database connection configuration management
   - Add connection health checks and testing
   - Create data source configuration UI
   - **Important**: This is for managing database connections, NOT for file imports

4. **Refine and Scale**
   - Extract common patterns to @repo/shared
   - Add comprehensive testing (unit, integration, E2E)
   - Implement caching and optimization
   - Setup CI/CD pipeline
   - Add authentication and authorization

---

**Reference Documents:**
- `CLEAN_ARCHITECTURE.md` - Detailed guide for implementing new modules following Tasks pattern
- `DATABASE_COMMANDS.md` - Complete database workflow and commands reference
- `.github/copilot-instructions.md` - AI development guidelines and patterns

*This document is a living plan that will be updated as we implement and learn.*