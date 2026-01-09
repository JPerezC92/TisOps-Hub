# Clean Architecture Migration Guide

> Reference implementation: `modules/request-tags`

---

## Table of Contents

- [Part 1: Migration Checklist](#part-1-migration-checklist)
- [Part 2: Reference Implementation](#part-2-reference-implementation)
- [Part 3: Code Templates](#part-3-code-templates)
- [Part 4: Test Templates](#part-4-test-templates)
- [Part 5: Files Reference](#part-5-files-reference)

---

# Part 1: Migration Checklist

## Prerequisites (Shared Infrastructure)

These already exist - just import them:

| Dependency | Location | Purpose |
|------------|----------|---------|
| `apiClient` | `@/shared/api/client` | HTTP client (get, post, postForm, delete) |
| `JSendSuccess<T>` | `@repo/reports/common` | Response type wrapper |
| `getErrorMessage()` | `@/lib/api` | Extract error from JSend response |
| `renderWithQueryClient()` | `@/test/utils/test-utils` | Test helper for React Query |
| `usePagination()` | `@/shared/hooks/use-pagination` | Pagination hook |
| `toast` | `sonner` | Notifications |
| UI Components | `@/components/ui/*` | Button, AlertDialog, Badge, etc. |

## Migration Steps

### Step 1: Create Module Structure

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
│   └── use-[feature]-filters.ts (if needed)
├── services/
│   └── [feature].service.ts
└── keys.ts
```

### Step 2: Implement Each Layer (in order)

1. **keys.ts** - Query keys
2. **services/[feature].service.ts** - API calls
3. **hooks/** - React Query wrappers
4. **components/** - Self-contained UI
5. **Update page.tsx** - Thin composition

### Step 3: Write Tests (in order)

1. **Factory** - Test data generator
2. **Service integration tests** - Mock fetch
3. **Component unit tests** - Mock service
4. **E2E tests** - Full user flows

---

# Part 2: Reference Implementation

## Directory Structure

```
modules/request-tags/
├── __tests__/
│   ├── components/
│   │   ├── request-tags-actions.spec.tsx
│   │   ├── request-tags-list.spec.tsx
│   │   └── request-tags-upload.spec.tsx
│   ├── helpers/
│   │   └── request-tag.factory.ts
│   └── services/
│       └── request-tags.service.integration.spec.ts
├── components/
│   ├── request-tags-actions.tsx
│   ├── request-tags-list.tsx
│   └── request-tags-upload.tsx
├── hooks/
│   ├── use-delete-request-tags.ts
│   ├── use-request-tags-filters.ts
│   ├── use-request-tags.ts
│   └── use-upload-request-tags.ts
├── services/
│   └── request-tags.service.ts
└── keys.ts
```

---

## Architecture Layers

### 1. Domain Layer

- **Types**: Imported from `@repo/reports/frontend` (shared package)
- **DTOs**: Defined in service file (`GetAllResponse`, `UploadResponse`, `DeleteResponse`)

### 2. Infrastructure Layer (Services)

**File**: `services/request-tags.service.ts`

```typescript
export const requestTagsService = {
  getAll: async (): Promise<GetAllResponse> => { ... },
  upload: async (file: File): Promise<UploadResponse> => { ... },
  deleteAll: async (): Promise<DeleteResponse> => { ... },
};
```

**Patterns**:

- Object-based API (not class-based)
- Uses shared `apiClient` from `@/shared/api/client`
- Unwraps JSend response format
- Pure functions with clear I/O contracts

### 3. Application Layer (Hooks)

**React Query Integration**:

| Hook | Type | Purpose |
|------|------|---------|
| `use-request-tags.ts` | Query | Fetch all tags with retry logic |
| `use-delete-request-tags.ts` | Mutation | Delete all tags + cache invalidation |
| `use-upload-request-tags.ts` | Mutation | Upload file + cache invalidation |
| `use-request-tags-filters.ts` | Custom | Client-side filtering logic (memoized) |

**Query Key Management**: `keys.ts`

```typescript
export const requestTagsKeys = {
  all: ['request-tags'] as const,
};
```

### 4. Presentation Layer (Components)

| Component | Purpose |
|-----------|---------|
| `request-tags-list.tsx` | Paginated table with filtering |
| `request-tags-actions.tsx` | Stats display + delete dialog |
| `request-tags-upload.tsx` | File upload with localStorage |

---

## Component Composition Pattern (Key to Testability)

### The Problem: Untestable Pages

If all logic is in a page component, unit testing is impossible:

```typescript
// BAD: Page with mixed logic - can't unit test
export default function RequestTagsPage() {
  const [file, setFile] = useState(null);
  const { data } = useQuery(...);
  const [searchTerm, setSearchTerm] = useState('');
  // 100+ lines of mixed UI and logic
}
```

### The Solution: Thin Page + Self-Contained Components

**Page Component** (`app/request-tags/page.tsx`):

```typescript
// GOOD: Page only composes - nothing to unit test (E2E covers it)
export default function RequestTagsPage() {
  return (
    <div>
      <h1>Request Tags</h1>
      <RequestTagsUpload />    {/* Test upload in isolation */}
      <RequestTagsActions />   {/* Test stats in isolation */}
      <RequestTagsList />      {/* Test filtering in isolation */}
    </div>
  );
}
```

### Component Self-Containment

Each component is **fully self-contained** with NO props:

| Component | Own Hooks | Own Logic |
|-----------|-----------|-----------|
| `RequestTagsUpload` | `useRequestTags`, `useUploadRequestTags`, `useState`, `useEffect` | File handling, localStorage, toast |
| `RequestTagsActions` | `useRequestTags`, `useDeleteRequestTags` | Stats calculation, delete dialog |
| `RequestTagsList` | `useRequestTags`, `useRequestTagsFilters`, `usePagination` | Filtering, table, pagination |

### Testing Strategy by Layer

| Layer | Test Type | Purpose |
|-------|-----------|---------|
| **Page** | E2E (Playwright) | Tests composition, real user flows, full integration |
| **Components** | Unit (Vitest) | Tests isolated logic with mocked services |
| **Services** | Integration (Vitest) | Tests API contracts with mocked fetch |

### Why This Pattern Works

1. **Page has no unit tests** - No logic to test, but E2E covers it
2. **Components are unit testable** - Mock service, test in isolation
3. **E2E validates composition** - Ensures all pieces work together
4. **Shared Hooks** - `useRequestTags()` used by all, tested via component tests

### Component → Hook → Service Flow

```
Component (UI + orchestration)
    ↓
Custom Hook (React Query wrapper)
    ↓
Service (API call)
    ↓
Mock at service level in tests
```

---

## Testing Patterns

### Test Organization

- Mirror structure under `__tests__/` folder
- Component tests: `__tests__/components/*.spec.tsx`
- Service tests: `__tests__/services/*.integration.spec.ts`
- Test helpers: `__tests__/helpers/`

### Factory Pattern

**File**: `__tests__/helpers/request-tag.factory.ts`

```typescript
export class RequestTagFactory {
  static create(overrides?: Partial<RequestTag>): RequestTag { ... }
  static createMany(count: number, overrides?: Partial<RequestTag>): RequestTag[] { ... }
}
```

- Uses `@faker-js/faker` for realistic data
- Supports partial overrides for specific test scenarios

### Service Mocking Strategy

```typescript
import { mock, MockProxy } from 'vitest-mock-extended';

let mockedService: MockProxy<typeof requestTagsService>;

vi.mock('@/modules/request-tags/services/request-tags.service', () => ({
  requestTagsService: mock<typeof requestTagsService>(),
}));

beforeEach(() => {
  mockedService = requestTagsService as MockProxy<typeof requestTagsService>;
  vi.clearAllMocks();
});
```

### HTTP Mocking for Integration Tests

```typescript
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});
```

### Test Utilities Used

- `renderWithQueryClient()` from `@/test/utils/test-utils.tsx`
- `@testing-library/user-event` for user interactions
- `waitFor`, `findBy` queries for async operations
- Toast mocking: `vi.mock('sonner', ...)`

### Test Coverage Summary

| Layer | Tests |
|-------|-------|
| Components | 16 unit tests |
| Services | 7 integration tests |
| E2E | 14 tests |
| **Total** | **37 test cases** |

---

## E2E Testing (Playwright)

### Location

- **Test file**: `e2e/__tests__/request-tags.spec.ts`
- **Fixtures**: `e2e/fixtures/REP01 XD TAG 2025.xlsx`
- **Config**: `playwright.config.ts`

### Test Suites (6 suites, 14 tests)

| Suite | Tests | Coverage |
|-------|-------|----------|
| Page Load | 4 | Header, upload section, stats grid, description |
| Upload Flow | 2 | File upload, button state management |
| Stats Grid | 2 | Stat cards display, refresh button |
| Data Table | 2 | Table display, search filter |
| Delete Flow | 3 | Dialog, cancellation, complete deletion |
| Integration | 1 | Full workflow: upload → view → delete |

### Selector Patterns (Accessibility-First)

```typescript
// Role-based (preferred)
page.getByRole('heading', { name: 'Request Tags', exact: true })
page.getByRole('button', { name: /upload and parse/i })

// Text-based
page.getByText('TOTAL TAGS')

// Input-specific
page.locator('input[type="file"]')
page.getByPlaceholder(/Request ID, Technician, Module/i)
```

### Setup Pattern

```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/request-tags');
});

// Nested setup for data-dependent tests
test.describe('Data Table Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Upload fixture data before each test
    const filePath = path.join(__dirname, '..', 'fixtures', 'REP01 XD TAG 2025.xlsx');
    await page.locator('input[type="file"]').setInputFiles(filePath);
    await page.getByRole('button', { name: /upload/i }).click();
  });
});
```

### Custom Timeouts

- Upload completion: 10s
- Table display: 10s
- Loading state: 15s
- Deletion: 5s

### Smoke Test

Also included in `e2e/__tests__/smoke.spec.ts` for quick validation.

---

## Data Flow

```
User Interaction → Components
                      ↓
              Custom Hooks (React Query)
                      ↓
              Services (requestTagsService)
                      ↓
              API Client (@/shared/api/client)
                      ↓
              HTTP → Backend → JSend Response
                      ↓
              Service unwraps response
                      ↓
              Query cache updated
                      ↓
              Component re-renders
```

---

## Error Handling Pattern

1. **Service Layer**: Throws on HTTP errors
2. **Hook Layer**: React Query handles errors, retry strategies
3. **Component Layer**: Try-catch with toast notifications

```typescript
// Component error handling example
const handleDelete = async () => {
  try {
    const result = await deleteMutation.mutateAsync();
    toast.success(`Deleted ${result.deleted} records`);
  } catch (error) {
    toast.error('Failed to delete', {
      description: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

---

# Part 3: Code Templates

## 1. Query Keys (`keys.ts`)

```typescript
export const [feature]Keys = {
  all: ['[feature]'] as const,
  // Add more granular keys if needed:
  // detail: (id: string) => ['[feature]', id] as const,
  // list: (filters: Filters) => ['[feature]', 'list', filters] as const,
};
```

## 2. Service (`services/[feature].service.ts`)

```typescript
import type { JSendSuccess } from '@repo/reports/common';
import { apiClient } from '@/shared/api/client';
import type { [Entity] } from '@repo/reports/frontend';

// Response DTOs
export interface GetAllResponse {
  items: [Entity][];
  total: number;
}

export interface CreateResponse {
  id: string;
}

export interface DeleteResponse {
  deleted: number;
}

// Service object
export const [feature]Service = {
  getAll: async (): Promise<GetAllResponse> => {
    const response = await apiClient.get<JSendSuccess<GetAllResponse>>('/[endpoint]');
    return response.data;
  },

  create: async (data: CreateDto): Promise<CreateResponse> => {
    const response = await apiClient.post<JSendSuccess<CreateResponse>>('/[endpoint]', data);
    return response.data;
  },

  upload: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.postForm<JSendSuccess<UploadResponse>>(
      '/[endpoint]/upload',
      formData
    );
    return response.data;
  },

  delete: async (id: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete<JSendSuccess<DeleteResponse>>(
      `/[endpoint]/${id}`
    );
    return response.data;
  },
};
```

## 3. Query Hook (`hooks/use-[feature].ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { [feature]Keys } from '../keys';
import { [feature]Service } from '../services/[feature].service';

export function use[Feature]() {
  return useQuery({
    queryKey: [feature]Keys.all,
    queryFn: [feature]Service.getAll,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
  });
}
```

## 4. Mutation Hook (`hooks/use-[action]-[feature].ts`)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { [feature]Keys } from '../keys';
import { [feature]Service } from '../services/[feature].service';

export function use[Action][Feature]() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: [feature]Service.[action],
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [feature]Keys.all });
    },
    onError: (error) => {
      console.error('[Action] failed:', error);
    },
    retry: 0, // No retry for mutations
  });
}
```

## 5. Filter Hook (`hooks/use-[feature]-filters.ts`)

```typescript
import { useState, useMemo } from 'react';
import type { [Entity] } from '@repo/reports/frontend';

export function use[Feature]Filters(items: [Entity][]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterField === 'all' || item.field === filterField;
      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, filterField]);

  const uniqueFields = useMemo(() => {
    return [...new Set(items.map((item) => item.field))].sort();
  }, [items]);

  return {
    searchTerm,
    setSearchTerm,
    filterField,
    setFilterField,
    filteredItems,
    uniqueFields,
  };
}
```

## 6. Component Template (`components/[feature]-list.tsx`)

```typescript
'use client';

import { use[Feature] } from '../hooks/use-[feature]';
import { use[Feature]Filters } from '../hooks/use-[feature]-filters';
import { usePagination } from '@/shared/hooks/use-pagination';

export function [Feature]List() {
  const { data, isLoading, error } = use[Feature]();
  const { filteredItems, searchTerm, setSearchTerm } = use[Feature]Filters(
    data?.items ?? []
  );
  const pagination = usePagination(filteredItems);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.items.length) return <div>No items found</div>;

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
      <table>{/* Table content */}</table>
      {/* Pagination controls */}
    </div>
  );
}
```

## 7. Page Template (`app/[feature]/page.tsx`)

```typescript
'use client';

import { [Feature]Upload } from '@/modules/[feature]/components/[feature]-upload';
import { [Feature]Actions } from '@/modules/[feature]/components/[feature]-actions';
import { [Feature]List } from '@/modules/[feature]/components/[feature]-list';

export default function [Feature]Page() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-4xl font-bold">[Feature Title]</h1>
        <p className="mt-3 text-muted-foreground">Description text</p>

        <[Feature]Upload />
        <[Feature]Actions />
        <[Feature]List />
      </main>
    </div>
  );
}
```

---

# Part 4: Test Templates

## 1. Factory (`__tests__/helpers/[entity].factory.ts`)

```typescript
import { faker } from '@faker-js/faker';
import type { [Entity] } from '@repo/reports/frontend';

export class [Entity]Factory {
  static create(overrides?: Partial<[Entity]>): [Entity] {
    return {
      id: overrides?.id ?? faker.string.uuid(),
      name: overrides?.name ?? faker.lorem.word(),
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      // Add more fields...
    };
  }

  static createMany(count: number, overrides?: Partial<[Entity]>): [Entity][] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
```

## 2. Service Integration Test (`__tests__/services/[feature].service.integration.spec.ts`)

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { [feature]Service } from '../../services/[feature].service';
import { [Entity]Factory } from '../helpers/[entity].factory';

describe('[feature]Service (Integration)', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch and unwrap JSend response', async () => {
      const mockItems = [Entity]Factory.createMany(3);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            status: 'success',
            data: { items: mockItems, total: mockItems.length },
          }),
      });

      const result = await [feature]Service.getAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/[endpoint]'),
        expect.objectContaining({ cache: 'no-store' })
      );
      expect(result.items).toHaveLength(3);
    });

    it('should throw on server error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            status: 'error',
            message: 'Server error',
          }),
      });

      await expect([feature]Service.getAll()).rejects.toThrow();
    });
  });
});
```

## 3. Component Unit Test (`__tests__/components/[feature]-list.spec.tsx`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { [Feature]List } from '../../components/[feature]-list';
import { [feature]Service } from '../../services/[feature].service';
import { [Entity]Factory } from '../helpers/[entity].factory';

// Mock service
vi.mock('../../services/[feature].service', () => ({
  [feature]Service: mock<typeof [feature]Service>(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('[Feature]List', () => {
  let mockedService: MockProxy<typeof [feature]Service>;

  beforeEach(() => {
    mockedService = [feature]Service as MockProxy<typeof [feature]Service>;
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithQueryClient(<[Feature]List />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should list items when data loads', async () => {
    const mockItems = [
      [Entity]Factory.create({ name: 'Item 1' }),
      [Entity]Factory.create({ name: 'Item 2' }),
    ];

    mockedService.getAll.mockResolvedValue({
      items: mockItems,
      total: mockItems.length,
    });

    renderWithQueryClient(<[Feature]List />);

    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(await screen.findByText('Item 2')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockItems = [
      [Entity]Factory.create({ name: 'Alpha' }),
      [Entity]Factory.create({ name: 'Beta' }),
    ];

    mockedService.getAll.mockResolvedValue({
      items: mockItems,
      total: mockItems.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<[Feature]List />);

    await screen.findByText('Alpha');

    const searchInput = screen.getByPlaceholder(/search/i);
    await user.type(searchInput, 'Alpha');

    await waitFor(() => {
      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Beta')).not.toBeInTheDocument();
    });
  });
});
```

## 4. E2E Test (`e2e/__tests__/[feature].spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('[Feature]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/[feature]');
  });

  test.describe('Page Load', () => {
    test('should display page header', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: '[Feature Title]', exact: true })
      ).toBeVisible();
    });

    test('should display main sections', async ({ page }) => {
      await expect(page.getByText('Upload Section')).toBeVisible();
      await expect(page.getByText('Stats Section')).toBeVisible();
    });
  });

  test.describe('Data Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Upload fixture data
      const filePath = path.join(__dirname, '..', 'fixtures', '[fixture].xlsx');
      await page.locator('input[type="file"]').setInputFiles(filePath);
      await page.getByRole('button', { name: /upload/i }).click();
      await page.waitForTimeout(2000);
    });

    test('should display data in table', async ({ page }) => {
      await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
    });

    test('should filter data', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    });
  });

  test.describe('Delete Flow', () => {
    test('should show confirmation dialog', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /delete/i });
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await expect(page.getByText(/confirm/i)).toBeVisible();
      }
    });
  });
});
```

---

# Part 5: Files Reference

| Layer | File | Purpose |
|-------|------|---------|
| **Shared** | `shared/api/client.ts` | HTTP client |
| **Shared** | `lib/api.ts` | Error message extraction |
| **Shared** | `test/utils/test-utils.tsx` | Test helpers |
| **Shared** | `shared/hooks/use-pagination.ts` | Pagination hook |
| **Types** | `@repo/reports/common` | JSend types |
| **Types** | `@repo/reports/frontend` | Entity types |
| **Reference** | `modules/request-tags/` | Full implementation example |
| **E2E Config** | `playwright.config.ts` | Playwright setup |

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| Service object pattern | Simple, functional API - easy to mock and test |
| React Query for state | Built-in caching, retry logic, DevTools support |
| Direct service imports | Clear dependencies, good IDE support |
| Factory pattern for tests | Eliminates test data duplication, type-safe |
| Mocking at service level | Tests UI logic separately from API details |
| Custom hooks for domain logic | Reusable, testable, separates concerns |
