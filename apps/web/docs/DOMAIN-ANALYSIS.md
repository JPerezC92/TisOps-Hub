# TisOps Hub - Clean Architecture Domain Analysis

> Analysis of bounded contexts, domain entities, and migration recommendations

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Part 1: Bounded Contexts](#part-1-bounded-contexts)
- [Part 2: Domain Entities](#part-2-domain-entities)
- [Part 3: Entity Relationships](#part-3-entity-relationships)
- [Part 4: Architectural Issues](#part-4-architectural-issues)
- [Part 5: Migration Status](#part-5-migration-status)
- [Part 6: Migration Recommendations](#part-6-migration-recommendations)

---

## Executive Summary

TisOps Hub is an incident management and analytics platform with:
- **16 NestJS controllers** (technical organization)
- **4 true bounded contexts** + cross-cutting concerns (domain organization)
- **11 domain entities**
- **2 frontend modules migrated** to clean architecture (error-logs, request-tags)
- **13 frontend pages pending** migration

**Key Finding**: The backend follows clean architecture patterns well, but the frontend has only 2 modules properly structured. The domain model has fragmentation issues that should be addressed.

**Domain Organization Principle**: Grouped by **business capability** (not technical pattern) following Clean Architecture principles.

---

## Part 1: Bounded Contexts

### BC #1: Configuration (Support Domain)

Master data and lookup tables used by other bounded contexts. **CRUD pattern, no file uploads.**

| Entity | Table | Purpose |
|--------|-------|---------|
| `Application` | `applications` | Application registry |
| `ApplicationPattern` | `application_patterns` | Pattern matching rules |
| `Module` | `modules` | Module display mapping |
| `Categorization` | `categorizations` | Category display mapping |
| `CorrectiveStatus` | `corrective_statuses` | Status display mapping |
| `MonthlyReportStatus` | `monthly_report_statuses` | Report status mapping |

**Use Cases**:
- CRUD operations for each registry
- Pattern matching for application routing
- Map raw values to display values

**Frontend Pages**:
- `/application-registry`
- `/module-registry`
- `/categorization-registry`
- `/corrective-status-registry`
- `/monthly-report-status-registry`

---

### BC #2: Request Management (Core Domain)

The primary business domain handling request ingestion, tagging, categorization, and relationships. **ETL pattern with Excel uploads.**

| Entity | Table | Source File |
|--------|-------|-------------|
| `RequestTag` | `request_tags` | REP01 XD TAG 2025.xlsx |
| `RequestCategorization` | `request_categorizations` | REP001 PARA ETIQUETAR.xlsx |
| `ParentChildRequest` | `parent_child_requests` | Excel upload |

**Use Cases**:
- Import requests from Excel files
- Tag requests with metadata
- Categorize requests by type
- Track parent-child relationships
- Query requests by various filters

**Frontend Pages**:
- `/request-tags` - Tag management (**migrated**)
- `/error-categorization` - Categorization view
- `/request-relationships` - Hierarchy view

---

### BC #3: Report Data (Operational Domain)

External operational data imported via Excel files for analysis. **ETL pattern with Excel uploads.**

| Entity | Table | Source File |
|--------|-------|-------------|
| `MonthlyReport` | `monthly_reports` | XD 2025 DATA INFORME MENSUAL.xlsx |
| `Problems` | `problems` | XD PROBLEMAS NUEVOS.xlsx |
| `SessionsOrders` | `sessions_orders` | SB INCIDENTES ORDENES SESIONES.xlsx |
| `WarRooms` | `war_rooms` | EDWarRooms2025.xlsx |
| `WeeklyCorrective` | `weekly_correctives` | XD SEMANAL CORRECTIVO.xlsx |

**Use Cases**:
- Upload and parse Excel files
- Store imported data
- Delete all records (reset)
- Get import statistics

**Frontend Pages**:
- `/monthly-report`
- `/problems`
- `/sessions-orders`
- `/war-rooms`
- `/weekly-corrective`

---

### BC #4: Analytics (Read-Heavy Domain)

Business intelligence and reporting derived from imported data. **Read-only queries, no entities.**

**Endpoints** (20+ queries):
- `GET /monthly-report/analytics` - Critical incidents
- `GET /monthly-report/module-evolution` - Module trends
- `GET /monthly-report/stability-indicators` - L2/L3 metrics
- `GET /monthly-report/category-distribution` - Category breakdown
- `GET /monthly-report/business-flow-priority` - Priority by module
- `GET /monthly-report/priority-by-app` - Priority by application
- `GET /monthly-report/incidents-by-week` - Weekly aggregation
- `GET /monthly-report/incidents-by-day` - Daily aggregation
- `GET /monthly-report/l3-summary` - L3 ticket summary
- `GET /monthly-report/l3-requests-by-status` - L3 by status
- `GET /sessions-orders/last-30-days` - Recent sessions/orders
- `GET /sessions-orders/incidents-vs-orders-by-month` - Monthly comparison
- `GET /weekly-corrective/l3-tickets-by-status` - L3 corrective status
- `GET /war-rooms/analytics` - War room metrics

**Frontend Pages**:
- `/analytics-dashboard` (3,544 lines - largest page)

**Dependencies**: Request Management, Configuration, Report Data

---

### Cross-Cutting Concerns

Infrastructure and isolated features.

| Entity | Table | Purpose | Status |
|--------|-------|---------|--------|
| `ErrorLog` | `error_logs` | System error logging | **Migrated** |
| `Task` | `tasks` | Task management | Isolated from domain |

**Frontend Pages**:
- `/error-logs` (migrated)
- `/tasks` (isolated, uses different API pattern)

---

## Part 2: Domain Entities

### Configuration Entities

#### Application + ApplicationPattern
```typescript
// Location: apps/reports-api/src/application-registry/domain/entities/
interface Application {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationPattern {
  id: number;
  applicationId: number;       // FK to Application
  pattern: string;
  priority: number;
  matchType: string;
  isActive: boolean;
}
```

#### Module
```typescript
// Location: apps/reports-api/src/module-registry/domain/entities/module.entity.ts
interface Module {
  id: number;
  sourceValue: string;
  displayValue: string;
  application: string;         // TEXT field, not FK!
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Registry Entities (Categorization, CorrectiveStatus, MonthlyReportStatus)
```typescript
// All follow the same pattern:
interface RegistryEntity {
  id: number;
  sourceValue: string;         // or rawStatus
  displayValue: string;        // or displayStatus
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### Request Management Entities

#### RequestTag
```typescript
// Location: apps/reports-api/src/request-tags/domain/entities/request-tag.entity.ts
interface RequestTag {
  requestId: string;           // PK
  requestIdLink: string;
  createdTime: Date;
  informacionAdicional: string;
  modulo: string;
  problemId: string;
  linkedRequestId: string;
  linkedRequestIdLink: string;
  jira: string;
  categorizacion: string;
  technician: string;
}

// Business methods
isAssigned(): boolean
hasJiraTicket(): boolean
isCategorized(): boolean
hasLinkedRequest(): boolean
```

#### RequestCategorization
```typescript
// Location: apps/reports-api/src/request-categorization/domain/entities/request-categorization.entity.ts
interface RequestCategorization {
  requestId: string;           // PK (same as RequestTag!)
  category: string;
  technician: string;
  createdTime: Date;
  modulo: string;              // Duplicated from RequestTag
  subject: string;
  problemId: string;           // Duplicated from RequestTag
  linkedRequestId: string;     // Duplicated from RequestTag
}
```

#### ParentChildRequest
```typescript
// Location: apps/reports-api/src/parent-child-requests/domain/entities/parent-child-request.entity.ts
interface ParentChildRequest {
  id: number;                  // Auto-increment PK
  requestId: string;           // FK to request
  linkedRequestId: string;     // FK to parent/child
  requestIdLink: string;
  linkedRequestIdLink: string;
}
```

---

### Report Data Entities

```typescript
// MonthlyReport, Problems, SessionsOrders, WarRooms, WeeklyCorrective
// All are external data imported from Excel files
// Each has: upload, getAll, deleteAll operations
// Specific fields vary by report type
```

---

### Cross-Cutting Entities

#### ErrorLog
```typescript
// Location: apps/reports-api/src/error-logs/domain/entities/error-log.entity.ts
interface ErrorLog {
  id: number;
  timestamp: Date;
  errorType: string;
  errorMessage: string;
  stackTrace: string;
  endpoint: string;
  method: string;
  userId: string;
  metadata: Record<string, unknown>;
}
```

#### Task
```typescript
// Location: apps/reports-api/src/tasks/domain/entities/task.entity.ts
interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Business methods
markAsCompleted(): void
updatePriority(priority: Priority): void
```

---

## Part 3: Entity Relationships

```
BC #1: CONFIGURATION
├── APPLICATION AGGREGATE
│   ├── Application (1)
│   └── ApplicationPattern (N)
├── Module (References Application.code as TEXT - weak relationship)
└── REGISTRY VALUE OBJECTS
    ├── Categorization (sourceValue → displayValue)
    ├── CorrectiveStatus (rawStatus → displayStatus)
    └── MonthlyReportStatus (rawStatus → displayStatus)

BC #2: REQUEST MANAGEMENT (Fragmented - needs refactoring)
├── RequestTag (PK: requestId)
├── RequestCategorization (PK: requestId) ← DUPLICATES DATA
└── ParentChildRequest (FK: requestId, linkedRequestId)

BC #3: REPORT DATA (External Sources)
├── MonthlyReport
├── Problems
├── SessionsOrders
├── WarRooms
└── WeeklyCorrective

BC #4: ANALYTICS
└── No entities (read-only queries across BC #2 and #3)

CROSS-CUTTING
├── ErrorLog (Infrastructure)
└── Task (Isolated Feature)
```

---

## Part 4: Architectural Issues

### Issue #1: Request Data Fragmentation (Critical)

**Problem**: Request data is split across 3 tables with duplication.

| Field | RequestTag | RequestCategorization | ParentChildRequest |
|-------|------------|----------------------|-------------------|
| requestId | PK | PK | FK |
| modulo | Yes | Yes (duplicate) | - |
| problemId | Yes | Yes (duplicate) | - |
| linkedRequestId | Yes | Yes (duplicate) | Yes |
| technician | Yes | Yes (duplicate) | - |
| createdTime | Yes | Yes (duplicate) | - |

**Impact**:
- Data inconsistency risk
- Unclear source of truth
- Complex queries

**Recommendation**: Merge into single `Request` aggregate with `Categorization` as value object.

---

### Issue #2: Duplicate Status Registries (Medium)

**Problem**: Two tables doing the exact same thing.

```
corrective_status_registry:     rawStatus → displayStatus
monthly_report_status_registry: rawStatus → displayStatus
```

**Recommendation**: Unify into `StatusMapping` with type discriminator, or use shared enum.

---

### Issue #3: Weak Module-Application Relationship (Medium)

**Problem**: Module references Application by text field, not foreign key.

```typescript
// Module entity
application: string;  // Should be applicationId: number (FK)
```

**Impact**: No referential integrity, can have orphan modules.

**Recommendation**: Add proper foreign key constraint.

---

### Issue #4: Task Isolation (Low)

**Problem**: Task entity has no connection to the incident management domain.

**Options**:
1. Remove Task feature entirely
2. Extract to separate package/microservice
3. Keep as isolated utility feature

---

### Issue #5: Primary Key Type Mismatch (Low)

**Problem**: Inconsistent PK types across tables.

| Table | PK Type |
|-------|---------|
| `request_tags` | TEXT (requestId) |
| `monthly_reports` | INTEGER |
| `parent_child_requests` | INTEGER (references TEXT IDs) |

**Impact**: Type casting in queries, potential join issues.

---

## Part 5: Migration Status

### Frontend Modules

| Module | Status | Location |
|--------|--------|----------|
| `error-logs` | Migrated | `modules/error-logs/` |
| `request-tags` | Migrated | `modules/request-tags/` |
| All others | Not migrated | Inline in `app/*/page.tsx` |

### Current Frontend Issues

1. **Direct fetch calls** instead of service layer
2. **No React Query** outside migrated modules
3. **80-90% code duplication** between similar pages
4. **Hardcoded localhost URLs** in some pages (e.g., `/tasks`)
5. **Mixed response handling** (some expect JSend, some don't)

---

## Part 6: Migration Recommendations

### Priority Order

#### Phase 1: Configuration BC (Easiest)

Simple CRUD registries with no dependencies. **No file uploads.**

| Order | Module | Lines | Complexity |
|-------|--------|-------|------------|
| 1 | `categorization-registry` | 567 | Very Low |
| 2 | `monthly-report-status-registry` | 576 | Very Low |
| 3 | `corrective-status-registry` | 620 | Low |
| 4 | `module-registry` | 656 | Low |
| 5 | `application-registry` | 808 | Medium (nested patterns) |

**Why first**:
- Establishes patterns for the team
- No external dependencies
- Quick wins build momentum
- CRUD-only pattern (simpler than ETL)

---

#### Phase 2: Request Management BC (Core Domain)

Core request tracking with ETL pattern. **`request-tags` already migrated.**

| Order | Module | Lines | Complexity |
|-------|--------|-------|------------|
| 6 | `request-relationships` | 364 | Medium |
| 7 | `error-categorization` | 874 | High (async modals) |

**Note**: Consider addressing data duplication issue (RequestTag vs RequestCategorization) before migrating.

---

#### Phase 3: Report Data BC (Operational)

External operational data with ETL pattern (similar to request-tags).

| Order | Module | Lines | Complexity |
|-------|--------|-------|------------|
| 8 | `problems` | 493 | Medium |
| 9 | `war-rooms` | 524 | Medium |
| 10 | `weekly-corrective` | 512 | Medium |
| 11 | `monthly-report` | 515 | Medium |
| 12 | `sessions-orders` | 783 | Medium-High (tabs) |

**Pattern**: Upload section + stats grid + filtered table

---

#### Phase 4: Analytics BC (Most Complex)

Read-only queries, depends on all other BCs.

| Order | Module | Lines | Complexity |
|-------|--------|-------|------------|
| 13 | `analytics-dashboard` | 3,544 | Very High |

**Recommendation**: Separate ticket, dedicated effort.

---

#### Cross-Cutting: Task Feature

| Option | Description |
|--------|-------------|
| A | Migrate as-is (fix API pattern to use apiClient) |
| B | Remove feature entirely |
| C | Extract to separate package |

---

### Module Structure Template

```
modules/[feature-name]/
├── __tests__/
│   ├── components/
│   │   └── [component].spec.tsx
│   ├── helpers/
│   │   └── [entity].factory.ts
│   └── services/
│       └── [feature].service.integration.spec.ts
├── components/
│   └── [component].tsx
├── hooks/
│   ├── use-[feature].ts
│   ├── use-[mutation].ts
│   └── use-[feature]-filters.ts
├── services/
│   └── [feature].service.ts
└── keys.ts
```

---

## Next Steps

1. **Phase 1 - Configuration BC**: Start with `categorization-registry` (simplest CRUD)
2. **Phase 2 - Request Management BC**: Continue with `request-relationships`, then `error-categorization`
3. **Phase 3 - Report Data BC**: Migrate `problems`, `war-rooms`, `weekly-corrective`, `monthly-report`, `sessions-orders`
4. **Phase 4 - Analytics BC**: Plan separately for `analytics-dashboard` (3,544 lines)
5. **Cross-Cutting**: Decide on Task feature (keep/remove/extract)
6. **Technical Debt**: Address data duplication (RequestTag vs RequestCategorization)

---

*Document updated: 2025-01-18*
*Reference implementations: `modules/request-tags/`, `modules/error-logs/`*
