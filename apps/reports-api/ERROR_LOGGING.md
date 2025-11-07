# Error Logging System

## Overview

The TisOps Hub API now includes a comprehensive error logging system that automatically captures and stores all exceptions in the database for tracking and analysis.

## Features

### 1. **Automatic Error Tracking**
- All exceptions (database errors, validation errors, etc.) are automatically caught
- Errors are stored in the `error_logs` table with full context
- User-friendly error messages are returned to clients
- Original technical details are preserved for debugging

### 2. **Database Schema**

The `error_logs` table includes:
- **id**: Auto-increment primary key
- **timestamp**: When the error occurred
- **errorType**: Type of error (DatabaseError, ValidationError, etc.)
- **errorMessage**: Error message
- **stackTrace**: Full stack trace for debugging
- **endpoint**: API endpoint where error occurred
- **method**: HTTP method (GET, POST, etc.)
- **userId**: User ID if authenticated
- **metadata**: JSON with request details (body, query, params, headers)

### 3. **API Endpoints**

#### Get All Error Logs
```
GET /error-logs?limit=100
```
Returns list of error logs, sorted by timestamp (newest first).

**Query Parameters:**
- `limit` (optional): Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2025-11-05T16:15:47.000Z",
    "errorType": "DatabaseError",
    "errorMessage": "UNIQUE constraint failed: rep01_tags.request_id",
    "stackTrace": "LibsqlError: UNIQUE constraint failed...",
    "endpoint": "/rep01-tags/upload",
    "method": "POST",
    "userId": null,
    "metadata": {
      "body": {},
      "query": {},
      "params": {}
    }
  }
]
```

#### Get Error Log by ID
```
GET /error-logs/:id
```
Returns detailed information about a specific error log.

### 4. **Error Handling**

The `DatabaseExceptionFilter` catches all exceptions and:

1. **Maps database errors to user-friendly messages:**
   - `UNIQUE constraint failed` → "A record with this information already exists"
   - `NOT NULL constraint failed` → "Required field is missing"
   - `FOREIGN KEY constraint failed` → "Referenced record does not exist"

2. **Logs error to database asynchronously** (doesn't block response)

3. **Returns standardized error response:**
```json
{
  "statusCode": 409,
  "message": "A record with this information already exists",
  "timestamp": "2025-11-05T16:15:47.000Z",
  "path": "/rep01-tags/upload",
  "method": "POST"
}
```

## Architecture

### Clean Architecture Pattern

```
src/error-logs/
├── domain/                           # Business Logic Layer
│   ├── entities/
│   │   └── error-log.entity.ts      # Pure domain entity
│   └── repositories/
│       └── error-log.repository.interface.ts  # Repository contract
├── application/                      # Use Cases Layer
│   └── use-cases/
│       ├── log-error.use-case.ts
│       ├── get-all-error-logs.use-case.ts
│       └── get-error-log-by-id.use-case.ts
├── infrastructure/                   # Technical Details Layer
│   ├── repositories/
│   │   └── error-log.repository.ts  # Drizzle ORM implementation
│   └── filters/
│       └── database-exception.filter.ts  # NestJS exception filter
├── error-logs.controller.ts          # API endpoints
└── error-logs.module.ts              # NestJS module setup
```

## Usage Examples

### Viewing Error Logs

1. **View recent errors:**
```bash
curl http://localhost:3000/error-logs?limit=10
```

2. **View specific error:**
```bash
curl http://localhost:3000/error-logs/1
```

3. **Check Swagger docs:**
Visit http://localhost:3000/api and look for the `error-logs` tag

### Testing Error Handling

Try uploading a duplicate file to trigger a UNIQUE constraint error:
```bash
curl -X POST http://localhost:3000/rep01-tags/upload \
  -F "file=@REP01 XD TAG 2025.xlsx"
```

The error will be:
- ✅ Logged to `error_logs` table
- ✅ Returned as user-friendly message
- ✅ Console logged for immediate visibility

## Benefits

1. **Debugging**: Full stack traces and request context preserved
2. **Monitoring**: Track error frequency and patterns
3. **User Experience**: User-friendly error messages
4. **Audit Trail**: Complete history of system errors
5. **Analytics**: Query error logs to identify systemic issues

## Future Enhancements

- Add error log cleanup/archival for old records
- Create error statistics dashboard
- Add email/Slack notifications for critical errors
- Implement error log search and filtering
- Add frontend page to view error logs in web UI
