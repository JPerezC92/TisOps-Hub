# Database Test Scripts Documentation

This guide explains how to correctly create and run standalone test scripts that connect to the database in this project.

## Quick Start

**To run a test script:**
```bash
cd apps/reports-api
pnpm exec dotenv -e .env -- node scripts/your-script-name.js
```

**Key Points:**
- ✅ Use `dotenv-cli` to load environment variables (already installed)
- ✅ Import schemas from `@repo/database` package
- ✅ NO need for `require('dotenv').config()` in scripts
- ✅ Use CommonJS (`require`), not ES6 imports
- ✅ Run scripts from `apps/reports-api/` directory

---

## Table of Contents
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Connection](#database-connection)
- [Script Template](#script-template)
- [Running Scripts](#running-scripts)
- [Common Pitfalls](#common-pitfalls)
- [Examples](#examples)

---

## Environment Setup

### Prerequisites
1. Ensure you have a `.env` file in the root of `apps/reports-api/` with:
   ```env
   DATABASE_URL=your_database_url
   DATABASE_AUTH_TOKEN=your_auth_token
   ```

2. The script must be located in `apps/reports-api/scripts/` directory

3. This project uses `dotenv-cli` (already installed in package.json)

### Loading Environment Variables

This project uses `dotenv-cli` to load environment variables when running scripts.

**✅ CORRECT WAY (Using dotenv-cli):**

Your scripts **DO NOT** need `require('dotenv').config()` at the top. Instead, run them with:

```bash
pnpm exec dotenv -e .env -- node scripts/your-script-name.js
```

Or if dotenv-cli is installed globally:
```bash
dotenv -e .env node scripts/your-script-name.js
```

**Alternative Method (Using dotenv package):**
If you prefer, you can add `require('dotenv').config();` at the top of your script and run it normally:
```bash
node scripts/your-script-name.js
```
However, using `dotenv-cli` is preferred because:
- It's already installed in the project
- No need to modify script code to load environment variables
- Cleaner separation between environment loading and script logic
- Same approach can be used for any script without code changes

**❌ WRONG WAY:**
```javascript
// Don't manually parse .env files
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
// ... manual parsing
```

---

## Database Connection

### Required Dependencies
```javascript
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
```

### Connection Setup

**✅ CORRECT WAY:**
```javascript
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

// Validate environment variables
if (!dbUrl) {
  console.error('Error: DATABASE_URL not set in .env file');
  process.exit(1);
}
if (!dbToken) {
  console.error('Error: DATABASE_AUTH_TOKEN not set in .env file');
  process.exit(1);
}

// Initialize database connection
let db;
try {
  const client = createClient({ url: dbUrl, authToken: dbToken });
  db = drizzle({ client });
} catch (error) {
  console.error('Error initializing database connection:', error);
  process.exit(1);
}
```

### Importing Schemas

**✅ CORRECT WAY:**
```javascript
// Import from the compiled database package
const { rep01Tags, parentChildRequests, requestCategorization } = require('@repo/database');
```

**❌ WRONG WAY:**
```javascript
// Don't import from TypeScript source files
const { rep01Tags } = require('../src/database/infrastructure/schemas/rep01-tags.schema');
```

### Using Drizzle Query Operators

```javascript
const { eq, and, or, isNull, sql } = require('drizzle-orm');

// Example query with filters
const results = await db
  .select()
  .from(rep01Tags)
  .where(
    and(
      eq(rep01Tags.informacionAdicional, 'No asignado'),
      eq(rep01Tags.linkedRequestId, '91244')
    )
  );
```

---

## Script Template

Here's a complete template for a database test script:

```javascript
// ============================================
// Test Script: [Brief Description]
// ============================================
// Purpose: [What does this script test/verify?]
// Usage: pnpm exec dotenv -e .env -- node scripts/your-script-name.js
// ============================================

// Note: No need for require('dotenv').config() when using dotenv-cli
const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { eq, and } = require('drizzle-orm');
const { rep01Tags, parentChildRequests } = require('@repo/database');

// ============================================
// Configuration
// ============================================
const TEST_PARAM_1 = 'value1';
const TEST_PARAM_2 = 'value2';

// ============================================
// Database Connection
// ============================================
const dbUrl = process.env.DATABASE_URL;
const dbToken = process.env.DATABASE_AUTH_TOKEN;

if (!dbUrl) {
  console.error('Error: DATABASE_URL not set in .env file');
  process.exit(1);
}
if (!dbToken) {
  console.error('Error: DATABASE_AUTH_TOKEN not set in .env file');
  process.exit(1);
}

let db;
try {
  const client = createClient({ url: dbUrl, authToken: dbToken });
  db = drizzle({ client });
} catch (error) {
  console.error('Error initializing database connection:', error);
  process.exit(1);
}

// ============================================
// Test Functions
// ============================================

async function runTests() {
  console.log('🔍 Starting Tests');
  console.log('='.repeat(80));

  try {
    // Test 1: Description
    console.log('\n1️⃣  Test 1: [Description]');
    const results1 = await db
      .select()
      .from(rep01Tags)
      .where(eq(rep01Tags.linkedRequestId, TEST_PARAM_1))
      .limit(10);

    console.log(`   Found ${results1.length} records`);
    console.table(results1);

    // Test 2: Description
    console.log('\n2️⃣  Test 2: [Description]');
    // ... more tests

    // Conclusion
    console.log('\n' + '='.repeat(80));
    console.log('✅ TESTS COMPLETED');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// Run Tests
// ============================================
runTests();
```

---

## Running Scripts

### From the Project Root
```bash
# Change to the reports-api directory
cd apps/reports-api

# Run the script with dotenv-cli
pnpm exec dotenv -e .env -- node scripts/your-script-name.js
```

### From the reports-api Directory
```bash
# Using pnpm exec
pnpm exec dotenv -e .env -- node scripts/your-script-name.js

# Or if dotenv-cli is installed globally
dotenv -e .env node scripts/your-script-name.js
```

### With package.json Scripts (Recommended)
You can add a script to `package.json`:
```json
{
  "scripts": {
    "test:script": "dotenv -e .env -- node scripts/your-script-name.js",
    "test:additional-info": "dotenv -e .env -- node scripts/test-additional-info-query.js"
  }
}
```

Then run:
```bash
pnpm test:script
# or
pnpm test:additional-info
```

---

## Common Pitfalls

### 1. ❌ Environment Variables Not Loading
**Problem:**
```javascript
// .env file exists but variables are undefined
console.log(process.env.DATABASE_URL); // undefined
```

**Solution:**
- Make sure you're running the script with `pnpm exec dotenv -e .env --` before the node command
- Ensure `.env` file is in `apps/reports-api/` directory
- Check file permissions and encoding (UTF-8)
- Verify the correct command: `pnpm exec dotenv -e .env -- node scripts/your-script.js`

### 2. ❌ Module Import Errors
**Problem:**
```javascript
const { rep01Tags } = require('@repo/database');
// Error: Cannot find module '@repo/database'
```

**Solution:**
- Ensure you're running the script from `apps/reports-api/` directory
- The workspace must be properly configured
- Database package must be built

### 3. ❌ Database Connection Errors
**Problem:**
```
Error: LibsqlError: SQLITE_CONSTRAINT_PRIMARYKEY
```

**Solution:**
- Check your database credentials
- Verify the database URL is correct
- Ensure your auth token is valid and not expired

### 4. ❌ Using TypeScript Imports
**Problem:**
```javascript
import { db } from '../src/database/infrastructure/drizzle';
// SyntaxError: Cannot use import statement outside a module
```

**Solution:**
- Test scripts must use CommonJS (`require`)
- Don't import from TypeScript source files
- Use the compiled `@repo/database` package

### 5. ❌ Incorrect File Paths
**Problem:**
```javascript
require('dotenv').config({ path: '.env' });
// Variables not loading when script is in /scripts directory
```

**Solution:**
- `dotenv` automatically looks for `.env` in the project root
- If needed, specify absolute path: `path: '../.env'`
- Run scripts from the correct directory

---

## Examples

### Example 1: Query by Multiple Conditions

```javascript
// scripts/test-multiple-conditions.js
// Usage: pnpm exec dotenv -e .env -- node scripts/test-multiple-conditions.js

const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { eq, and } = require('drizzle-orm');
const { rep01Tags } = require('@repo/database');

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const db = drizzle({ client });

async function test() {
  const results = await db
    .select()
    .from(rep01Tags)
    .where(
      and(
        eq(rep01Tags.informacionAdicional, 'No asignado'),
        eq(rep01Tags.linkedRequestId, '91244')
      )
    );

  console.log(`Found ${results.length} records`);
  console.table(results);
}

test();
```

### Example 2: LEFT JOIN Query

```javascript
// scripts/test-left-join.js
// Usage: pnpm exec dotenv -e .env -- node scripts/test-left-join.js

const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { eq, and, isNull } = require('drizzle-orm');
const { rep01Tags, parentChildRequests } = require('@repo/database');

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const db = drizzle({ client });

async function test() {
  // Find missing IDs
  const results = await db
    .select({
      requestId: parentChildRequests.requestId,
      requestIdLink: parentChildRequests.requestIdLink,
    })
    .from(parentChildRequests)
    .leftJoin(rep01Tags, eq(parentChildRequests.requestId, rep01Tags.requestId))
    .where(
      and(
        eq(parentChildRequests.linkedRequestId, '91244'),
        isNull(rep01Tags.requestId)
      )
    );

  console.log(`Found ${results.length} missing IDs`);
  console.table(results);
}

test();
```

### Example 3: Count and Group By

```javascript
// scripts/test-aggregations.js
// Usage: pnpm exec dotenv -e .env -- node scripts/test-aggregations.js

const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { eq } = require('drizzle-orm');
const { rep01Tags } = require('@repo/database');

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const db = drizzle({ client });

async function test() {
  const allRecords = await db
    .select()
    .from(rep01Tags)
    .where(eq(rep01Tags.informacionAdicional, 'No asignado'));

  // Group by linkedRequestId
  const grouped = {};
  allRecords.forEach(r => {
    if (!grouped[r.linkedRequestId]) {
      grouped[r.linkedRequestId] = 0;
    }
    grouped[r.linkedRequestId]++;
  });

  console.log('Records by LinkedRequestId:');
  console.table(
    Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .map(([linkedReqId, count]) => ({
        'Linked Request ID': linkedReqId,
        'Count': count
      }))
  );
}

test();
```

---

## Best Practices

1. **Always validate environment variables** before attempting database connection
2. **Use try-catch blocks** to handle database errors gracefully
3. **Add descriptive console.log statements** to track script progress
4. **Use console.table()** for readable output of query results
5. **Add LIMIT clauses** when testing to avoid overwhelming output
6. **Document your test cases** with clear descriptions and expected outcomes
7. **Clean up after tests** if your script modifies data (insert/update/delete)
8. **Use meaningful variable names** that reflect what you're testing

---

## Troubleshooting Checklist

- [ ] `.env` file exists in `apps/reports-api/` directory
- [ ] `DATABASE_URL` and `DATABASE_AUTH_TOKEN` are set correctly in `.env`
- [ ] Script is located in `apps/reports-api/scripts/` directory
- [ ] Running script from `apps/reports-api/` directory
- [ ] Using `pnpm exec dotenv -e .env -- node scripts/...` to run the script
- [ ] NOT using `require('dotenv').config()` in the script (dotenv-cli handles it)
- [ ] Importing from `@repo/database`, not TypeScript source files
- [ ] Using CommonJS syntax (`require`), not ES6 imports
- [ ] Database connection is validated before queries
- [ ] Error handling is in place

---

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [LibSQL Documentation](https://docs.turso.tech/libsql)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

---

**Last Updated:** 2025-11-07
**Maintained By:** Development Team
