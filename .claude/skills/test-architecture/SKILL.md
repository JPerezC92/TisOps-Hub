---
name: test-architecture
description: Reference blueprint for the backend and frontend test pyramid following Clean Architecture. Use when writing, reviewing, or auditing tests.
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

# Test Architecture Blueprint

This skill defines the canonical test pyramid for `apps/reports-api` (backend) and `apps/web` (frontend). Use it when creating, reviewing, or auditing tests.

---

## Backend Test Pyramid

```
test/{module}/
├── application/use-cases/     → Unit tests (mocked repos)
├── infrastructure/            → Integration tests (real in-memory DB)
└── *.e2e-spec.ts              → E2E tests (full HTTP stack)
```

| Layer | File pattern | What it tests | DB |
|---|---|---|---|
| **Unit** | `application/use-cases/*.spec.ts` | Pure use case business logic. Repos are mocked via `vitest-mock-extended`. No framework, no DB. | None |
| **Integration** | `infrastructure/*.repository.integration.spec.ts` | Drizzle repository directly against real in-memory SQLite. Verifies SQL queries, defaults, null handling, adapters. | In-memory SQLite |
| **Parser unit** | `infrastructure/*.parser.spec.ts` | Excel parser logic with mocked `xlsx`. Verifies column mapping, type coercion, hyperlink extraction, error handling. | None |
| **E2E** | `*.e2e-spec.ts` | Full HTTP stack via supertest. Boots entire NestJS app with `TestDatabaseModule` overriding `DatabaseModule`. Controller → use cases → real repo → real DB. | In-memory SQLite |

### What each layer catches

- **Unit** — business logic bugs, wrong conditions, missing domain errors
- **Integration** — broken SQL queries, wrong defaults, null handling, adapter bugs, upsert conflicts
- **Parser unit** — wrong column names, missing type conversions, broken hyperlink extraction, bad error messages
- **E2E** — HTTP contract bugs, wrong status codes, missing validation, routing issues

### Controller tests are NOT part of this pyramid

Controller unit tests (mocking use cases) are **redundant** — the E2E tests already cover everything they test, properly. Do not create `*.controller.spec.ts` files.

---

## Backend Unit Test Pattern

```ts
// test/{module}/application/use-cases/{name}.use-case.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { ITaskRepository } from '@tasks/domain/repositories/task.repository.interface';
import { CreateTaskUseCase } from '@tasks/application/use-cases/create-task.use-case';

describe('CreateTaskUseCase', () => {
  let repository: MockProxy<ITaskRepository>;
  let useCase: CreateTaskUseCase;

  beforeEach(() => {
    repository = mock<ITaskRepository>();
    useCase = new CreateTaskUseCase(repository);
  });

  it('should create a task', async () => {
    repository.create.mockResolvedValue(/* domain entity */);
    const result = await useCase.execute({ title: 'Test' });
    expect(result.title).toBe('Test');
  });
});
```

---

## Backend Integration Test Pattern

```ts
// test/{module}/infrastructure/{name}.repository.integration.spec.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createTestDatabase, migrateTestDatabase } from '@repo/database';
import { TaskRepository } from '@tasks/infrastructure/repositories/task.repository';

describe('TaskRepository (Integration)', () => {
  let repository: TaskRepository;

  beforeAll(async () => {
    const { db } = createTestDatabase();
    await migrateTestDatabase(db);
    repository = new TaskRepository(db);
  });

  it('create() persists with correct defaults', async () => {
    const task = await repository.create({ title: 'Test' });
    expect(task.id).toBeDefined();
    expect(task.priority).toBe('medium'); // default
    expect(task.completed).toBe(false);   // default
  });

  it('findById() returns null for missing id', async () => {
    const result = await repository.findById(999999);
    expect(result).toBeNull();
  });
});
```

Key points:
- Use `createTestDatabase()` + `migrateTestDatabase()` **directly** — no NestJS overhead
- Instantiate the repository class directly with the DB instance
- One fresh in-memory DB per `describe` block (created in `beforeAll`)

### `beforeAll` vs `beforeEach` — when to reset state

**Use `beforeAll` only (additive tests)** when all tests only insert data and never delete. Tests accumulate state — use unique data per test to avoid conflicts. Best for: registry-style modules (corrective-status-registry, application-registry, error-logs).

**Use `beforeAll` + `beforeEach` with `deleteAll()`** when tests need a clean slate — e.g., modules that test bulk insert counts, `findAll` pagination, or stats aggregation. Best for: sessions-orders, war-rooms, weekly-corrective, request-tags, parent-child-requests, monthly-report.

```ts
beforeAll(async () => {
  const { db } = createTestDatabase();
  await migrateTestDatabase(db);
  repository = new Repository(db);
});

beforeEach(async () => {
  await repository.deleteAll(); // reset between tests
});
```

---

## Backend Parser Unit Test Pattern

Parsers transform Excel `Buffer` → domain insert records. They are unit tested by mocking the `xlsx` library — no real files needed.

```ts
// test/{module}/infrastructure/{name}-excel.parser.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MyParser } from '@my-module/infrastructure/parsers/my-excel.parser';
import * as XLSX from 'xlsx';

vi.mock('xlsx', () => ({
  default: {
    read: vi.fn(),
    utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn(), decode_range: vi.fn() },
  },
  read: vi.fn(),
  utils: { sheet_to_json: vi.fn(), encode_cell: vi.fn(), decode_range: vi.fn() },
}));

describe('MyParser', () => {
  let parser: MyParser;

  beforeEach(() => {
    parser = new MyParser();
    vi.clearAllMocks();
  });

  it('should map all fields from Excel row', () => {
    vi.mocked(XLSX.read).mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    } as any);
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([
      { 'Request ID': '100001', 'Subject': 'Test', /* ... */ },
    ]);

    const result = parser.parse(Buffer.from('test'));

    expect(result[0]!.requestId).toBe(100001);
    expect(result[0]!.subject).toBe('Test');
  });

  it('should throw when Excel sheet is empty', () => {
    vi.mocked(XLSX.read).mockReturnValue({ SheetNames: ['Sheet1'], Sheets: { Sheet1: {} } } as any);
    vi.mocked(XLSX.utils.sheet_to_json).mockReturnValue([]);

    expect(() => parser.parse(Buffer.from('test'))).toThrow('Excel file is empty');
  });
});
```

Key points:
- Mock both the default export and named exports of `xlsx` (both forms are used internally)
- Call `vi.clearAllMocks()` in `beforeEach` to reset call counts and return values
- Test: field mapping, type coercion (string → number), hyperlink extraction, HTML entity decoding, error cases (empty file, invalid values)

---

## Backend E2E Test Pattern

```ts
// test/{module}/{module}.e2e-spec.ts
import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('TasksController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /tasks should create a task', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'E2E Task' })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.data.title).toBe('E2E Task');
  });
});
```

---

## Frontend Test Pyramid

```
modules/{module}/__tests__/
├── components/    → Unit tests (mocked service)
└── services/      → Integration tests (mocked fetch)

e2e/__tests__/
├── smoke.spec.ts              → Phase 1: page loads + pageerror detection
├── {module}.spec.ts           → Phase 2: seeded-data interactions
└── request-tags.spec.ts       → Phase 3: data-mutation (upload/delete)
```

| Layer | File pattern | What it tests | Tool |
|---|---|---|---|
| **Component unit** | `components/*.spec.tsx` | UI component with mocked service via `vi.mock` | Vitest + jsdom |
| **Service integration** | `services/*.service.integration.spec.ts` | Service HTTP parsing with mocked `fetch` via `vi.stubGlobal` | Vitest |
| **E2E** | `e2e/__tests__/*.spec.ts` | Full browser, real DB, 3 ordered phases | Playwright |

### Frontend Component Test Pattern

```ts
// modules/{module}/__tests__/components/{component}.spec.tsx
import { vi } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { renderWithQueryClient } from '@/test/utils/test-utils';

vi.mock('@/modules/my-module/services/my-module.service', () => ({
  myModuleService: mock<typeof myModuleService>(),
}));

it('should render records', async () => {
  mockedService.getAll.mockResolvedValue({ data: [...], total: 3 });
  renderWithQueryClient(<MyComponent />);
  expect(await screen.findByText('...')).toBeInTheDocument();
});
```

### Frontend E2E `pageerror` Pattern

All `seeded-data` phase specs must include this to catch runtime JS crashes:

```ts
let pageErrors: string[];

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/my-page');
});

test.afterEach(async () => {
  expect(pageErrors, `Uncaught exceptions:\n${pageErrors.join('\n')}`).toHaveLength(0);
});
```

---

## Known Limitations

- `monthly-report` and `weekly-corrective` have many complex multi-table analytics methods. Integration tests for these cover core CRUD and key query paths — not every analytics method. The complex analytics are covered by use case unit tests.
- Parser tests mock `xlsx` entirely — they do not test against real Excel files. Edge cases in real-world Excel formatting (merged cells, unusual encodings) are only caught in production.

---

## Run Commands

```bash
# Backend unit + integration + parser tests
pnpm --filter reports-api test

# Backend E2E tests only
pnpm --filter reports-api test:e2e

# Both backend and frontend E2E (CI)
pnpm turbo test:e2e --force

# Frontend unit tests
pnpm --filter web test

# Frontend E2E tests
pnpm --filter web exec playwright test
```
