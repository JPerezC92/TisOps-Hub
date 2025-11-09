# Database Commands Reference

## Overview
This project uses **Drizzle ORM** with **Turso** (SQLite cloud database) for data persistence.

## Available Commands

### � **Push Schema (Development)**
```bash
pnpm db:push
```
**Equivalent to:** `npx drizzle-kit push`

**Use when:**
- Quick prototyping and development
- You want to sync schema changes directly without creating migration files
- Testing schema changes locally
- Rapid iterations in development environment

**What it does:**
- Pulls current schema from database
- Compares with your local schema files
- Applies changes directly to the database
- **No migration files are created**

---

### 📝 **Generate Migrations**
```bash
pnpm db:generate
```
**Equivalent to:** `npx drizzle-kit generate`

**Use when:**
- You want to create version-controlled migration files
- Preparing changes for production
- You need a history of schema changes
- Team collaboration requires tracked database changes

**What it does:**
- Compares current schema with previous state
- Generates SQL migration file in `src/database/infrastructure/migrations/`
- Creates timestamped migration files (e.g., `0001_migration_name.sql`)
- Does **not** apply migrations (just generates files)

---

### ⬆️ **Apply Migrations**
```bash
pnpm db:migrate
```
**Equivalent to:** `npx drizzle-kit migrate`

**Use when:**
- Applying generated migrations to database
- Deploying to production
- You want controlled, version-tracked schema updates
- Running migrations in CI/CD pipeline

**What it does:**
- Reads migration files from `src/database/infrastructure/migrations/`
- Applies pending migrations to the database
- Tracks which migrations have been applied in `__drizzle_migrations` table
- Runs migrations in sequential order

---

### 🎨 **Drizzle Studio (Database GUI)**
```bash
pnpm db:studio
```
**Equivalent to:** `npx drizzle-kit studio`

**Use when:**
- You want to browse and edit data visually
- Exploring database structure
- Quick data inspection and modification
- Debugging data issues

**What it does:**
- Launches web-based database GUI
- Opens in browser (usually http://localhost:4983)
- Allows viewing tables, editing data, running queries
- Real-time database explorer

---

### 🔌 **Test Connection** (Custom)
```bash
pnpm test:connection
```

**Use when:**
- Verifying database credentials
- Troubleshooting connection issues
- Confirming environment variables are loaded correctly

**What it does:**
- Tests connection to Turso database
- Displays connection URL and token length
- Runs a simple SELECT query to verify connectivity

---

### 🗑️ **Reset Database** (Custom)
```bash
pnpm db:reset
```

**⚠️ IMPORTANT - Use with Caution:**
- This command **deletes ALL tables and data** from the database
- This is **irreversible** and should only be used in development
- **NEVER** run this in production

**Use when:**
- You need a clean slate in development
- Testing fresh database state
- Resolving severe migration conflicts
- Starting over with schema changes

**What it does:**
- Drops all tables (including `tasks`, `__drizzle_migrations`, etc.)
- Deletes all data permanently
- Shows which tables were dropped

**After running reset, recreate tables with:**
```bash
pnpm db:migrate
```

**🚨 CRITICAL:** After reset, you **MUST** use `pnpm db:migrate` to recreate tables, **NOT** `pnpm db:push`. 

**Why?** `db:push` will recreate your schema tables but will **NOT** recreate the `__drizzle_migrations` table, which tracks migration history. This will cause migration tracking issues.

**Correct workflow:**
```bash
# 1. Reset database (drops everything)
pnpm db:reset

# 2. Recreate with migrations (recreates tables + migration history)
pnpm db:migrate
```

---

## Workflow Examples

### **Development Workflow (Fast Iteration)**
```bash
# 1. Modify schema in src/database/infrastructure/schemas/*.schema.ts
# 2. Push changes directly
pnpm db:push
```

### **Production Workflow (Version Controlled)**
```bash
# 1. Modify schema in src/database/infrastructure/schemas/*.schema.ts

# 2. Generate migration file
pnpm db:generate

# 3. Review the generated migration in src/database/infrastructure/migrations/

# 4. Apply migration to database
pnpm db:migrate

# 5. Commit migration files to git
git add src/database/infrastructure/migrations
git commit -m "Add migration for [feature]"
```

---

## Command Comparison

| Command | Creates Migrations | Applies Changes | Use Case |
|---------|-------------------|-----------------|----------|
| `db:push` | ❌ No | ✅ Yes | Development/Prototyping |
| `db:generate` | ✅ Yes | ❌ No | Creating migration files |
| `db:migrate` | ❌ No | ✅ Yes | Applying migrations (Production) |
| `db:studio` | ❌ No | ❌ No | Visual database browser |
| `db:reset` | ❌ No | ❌ No (Deletes) | ⚠️ Drop all tables (Dev only) |

**⚠️ IMPORTANT:** After `db:reset`, always use `db:migrate` (NOT `db:push`) to ensure the `__drizzle_migrations` table is properly recreated.

---

## Environment Variables

Required in `.env` file:

```properties
DATABASE_URL=libsql://[database-name]-[org].turso.io
DATABASE_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**
- Never commit `.env` file to git
- Obtain credentials from Turso dashboard
- Token should be ~200+ characters long
- Format: `libsql://` prefix is required for Turso

---

## File Locations

### **Schema Files** (Centralized in Database Package)
```
packages/database/src/schemas/
├── tasks.schema.ts                     # Task table definition
├── request-categorization.schema.ts    # Request categorization table
├── parent-child-requests.schema.ts     # Parent-child relationships table
├── request-tags.schema.ts              # Request tags table
├── error-logs.schema.ts                # Error logs table
└── index.ts                            # Export all schemas
```

**Note:** All Drizzle schemas are now centralized in the `@repo/database` package for better organization and reusability across the monorepo.

### **Migration Files**
```
apps/reports-api/src/database/infrastructure/migrations/
├── 0000_initial_migration.sql
├── 0001_add_priority_column.sql
└── meta/              # Drizzle migration metadata
    ├── _journal.json  # Migration history
    └── 0000_snapshot.json
```

### **Configuration Files**
```
apps/reports-api/
├── drizzle.config.ts  # Drizzle Kit configuration
├── migrate.js         # Custom migration script (backup)
├── test-connection.js # Connection test script
└── .env              # Environment variables (NOT in git)
```

---

## Troubleshooting

### **401 Unauthorized Error**
- Verify `DATABASE_AUTH_TOKEN` is complete and correct
- Check if token has expired (regenerate in Turso dashboard)
- Ensure `.env` file is in `apps/reports-api/` directory
- Run `pnpm test:connection` to verify credentials

### **Connection Timeout**
- Verify `DATABASE_URL` format: `libsql://[database]-[org].turso.io`
- Check internet connectivity
- Confirm database exists in Turso dashboard
- Ensure no firewall blocking connection

### **Migration Conflicts**
```bash
# If migrations get out of sync, you can:
# 1. Check current migration status
pnpm db:migrate

# 2. For development only: use push to sync
pnpm db:push

# 3. Regenerate migrations from current schema
pnpm db:generate
```

### **Schema Drift**
If your database schema doesn't match your code:
```bash
# Option 1: Push current schema (dev only)
pnpm db:push

# Option 2: Generate and apply new migration
pnpm db:generate
pnpm db:migrate
```

---

## Best Practices

### **Development**
- ✅ Use `pnpm db:push` for rapid prototyping
- ✅ Test changes locally before generating migrations
- ✅ Use `pnpm db:studio` to inspect data
- ⚠️ After `pnpm db:reset`, always use `pnpm db:migrate` (not `db:push`)

### **Production**
- ✅ Always use `pnpm db:generate` + `pnpm db:migrate`
- ✅ Review migration files before applying
- ✅ Commit migration files to version control
- ✅ Never use `db:push` in production
- ✅ Backup database before running migrations

### **Team Collaboration**
- ✅ Pull latest migrations before creating new ones
- ✅ Resolve migration conflicts early
- ✅ Use descriptive migration names
- ✅ Document breaking changes in migration files

---

## Additional Resources

- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **Drizzle + Turso Guide**: https://orm.drizzle.team/docs/get-started/turso-new
- **Turso Documentation**: https://docs.turso.tech/
- **Drizzle Kit Commands**: https://orm.drizzle.team/kit-docs/overview
