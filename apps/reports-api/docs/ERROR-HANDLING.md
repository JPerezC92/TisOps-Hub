# Domain Error Handling Pattern

This document describes the error handling architecture used in the Reports API.

## Overview

The API uses a **Domain Error pattern** combined with **JSend response format** to provide consistent, predictable error responses. This approach:

- Separates business logic errors from infrastructure concerns
- Provides type-safe error handling across layers
- Ensures consistent API response format for clients
- Maps domain errors to appropriate HTTP status codes

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Controller │ ──▶ │   Service   │ ──▶ │   UseCase   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │            returns DomainError
                           │            or Entity
                           │                   │
                    throws DomainError ◀───────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   DomainErrorFilter   │
               │   (ExceptionFilter)   │
               └───────────────────────┘
                           │
                           ▼
               ┌───────────────────────┐
               │   JSend Response      │
               │   { status: "fail" }  │
               └───────────────────────┘
```

## Core Components

### 1. DomainError Base Class

Location: `src/shared/domain/errors/domain.error.ts`

Abstract base class for all domain-specific errors.

```typescript
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static isDomainError(value: unknown): value is DomainError {
    return value instanceof DomainError;
  }
}
```

### 2. Error Codes

Location: `src/shared/domain/errors/error-codes.ts`

Centralized registry of all error codes.

```typescript
export const ERROR_CODES = {
  REQUEST_TAG_ALREADY_EXISTS: 'REQUEST_TAG_ALREADY_EXISTS',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
```

### 3. Error Messages

Location: `src/shared/domain/errors/error.messages.ts`

Factory functions that generate human-readable error messages.

```typescript
export const ERROR_MESSAGES = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: (requestId: string) =>
    `Request tag with ID '${requestId}' already exists`,
} as const;
```

### 4. Domain Error Filter

Location: `src/shared/infrastructure/filters/domain-error.filter.ts`

NestJS exception filter that catches `DomainError` and converts to HTTP responses.

```typescript
const errorCodeToHttpStatusMap: Record<ErrorCode, HttpStatus> = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: HttpStatus.CONFLICT,
};

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = errorCodeToHttpStatusMap[exception.code as ErrorCode];

    response.status(status).json({
      status: 'fail',
      data: {
        message: exception.message,
        code: exception.code,
      },
    });
  }
}
```

### 5. JSend Interfaces

Location: `src/shared/interfaces/jsend.interface.ts`

TypeScript interfaces for the JSend response format.

```typescript
export interface JSendSuccess<T> {
  status: 'success';
  data: T;
}

export interface JSendFail<T> {
  status: 'fail';
  data: T;
}

export interface JSendError {
  status: 'error';
  message: string;
  code?: string;
  data?: unknown;
}
```

## Adding a New Domain Error

Follow these steps to add a new domain error:

### Step 1: Add Error Code

In `src/shared/domain/errors/error-codes.ts`:

```typescript
export const ERROR_CODES = {
  REQUEST_TAG_ALREADY_EXISTS: 'REQUEST_TAG_ALREADY_EXISTS',
  // Add your new error code
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
} as const;
```

### Step 2: Add Error Message Factory

In `src/shared/domain/errors/error.messages.ts`:

```typescript
export const ERROR_MESSAGES = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: (requestId: string) =>
    `Request tag with ID '${requestId}' already exists`,
  // Add your new message factory
  [ERROR_CODES.RESOURCE_NOT_FOUND]: (resourceType: string, id: string) =>
    `${resourceType} with ID '${id}' was not found`,
} as const;
```

### Step 3: Create Domain Error Class

Create a new file in your module's `domain/errors/` folder:

```typescript
// src/your-module/domain/errors/resource-not-found.error.ts
import { DomainError } from '@shared/domain/errors/domain.error';
import { ERROR_CODES } from '@shared/domain/errors/error-codes';
import { ERROR_MESSAGES } from '@shared/domain/errors/error.messages';

export class ResourceNotFoundError extends DomainError {
  readonly code = ERROR_CODES.RESOURCE_NOT_FOUND;
  readonly resourceType: string;
  readonly resourceId: string;

  constructor(resourceType: string, resourceId: string) {
    super(ERROR_MESSAGES[ERROR_CODES.RESOURCE_NOT_FOUND](resourceType, resourceId));
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}
```

### Step 4: Map Error Code to HTTP Status

In `src/shared/infrastructure/filters/domain-error.filter.ts`:

```typescript
const errorCodeToHttpStatusMap: Record<ErrorCode, HttpStatus> = {
  [ERROR_CODES.REQUEST_TAG_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  // Add your mapping
  [ERROR_CODES.RESOURCE_NOT_FOUND]: HttpStatus.NOT_FOUND,
};
```

### Step 5: Use in Use Case

```typescript
// In your use case
export class GetResourceUseCase {
  constructor(private readonly repository: IResourceRepository) {}

  async execute(id: string): Promise<Resource | ResourceNotFoundError> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      return new ResourceNotFoundError('Resource', id);
    }
    return resource;
  }
}
```

### Step 6: Handle in Service

```typescript
// In your service
async getResource(id: string): Promise<JSendSuccess<Resource>> {
  const result = await this.getResourceUseCase.execute(id);

  if (DomainError.isDomainError(result)) {
    throw result; // DomainErrorFilter will catch this
  }

  return {
    status: 'success',
    data: result,
  };
}
```

## Response Format Reference

### Success Response

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "requestId": "REQ-001",
    "createdTime": "2025-01-15T10:00:00Z"
  }
}
```

### Fail Response (Business/Validation Errors)

```json
{
  "status": "fail",
  "data": {
    "message": "Request tag with ID 'REQ-001' already exists",
    "code": "REQUEST_TAG_ALREADY_EXISTS"
  }
}
```

### Error Response (Server Errors)

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## HTTP Status Code Mapping

| Error Code | HTTP Status | Use Case |
|------------|-------------|----------|
| `REQUEST_TAG_ALREADY_EXISTS` | 409 Conflict | Duplicate resource creation |
| `RESOURCE_NOT_FOUND` | 404 Not Found | Resource lookup failed |
| `VALIDATION_ERROR` | 400 Bad Request | Invalid input data |
| `UNAUTHORIZED_ACTION` | 403 Forbidden | Permission denied |

## Best Practices

1. **Return, don't throw in use cases**: Use cases should return `Entity | DomainError`, not throw exceptions.

2. **Throw in services**: Services check the result and throw if it's a `DomainError`, letting the filter handle HTTP conversion.

3. **Keep errors domain-specific**: Error classes belong in the module's `domain/errors/` folder, while shared infrastructure stays in `shared/`.

4. **Use type guards**: Always use `DomainError.isDomainError()` to check results.

5. **Include context**: Store relevant identifiers (like `requestId`) as properties on the error for debugging.
