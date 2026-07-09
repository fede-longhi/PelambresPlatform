---
name: db-migration
description: Authors safe SQL migrations for PelambresPlatform on Neon Postgres. Use when adding or changing database schema, creating tables, columns, indexes, or backfills via sql/migrations/.
---

# Database Migration

Add numbered SQL files under `sql/migrations/` and apply with `pnpm db:migrate` (dev) or `pnpm db:migrate:main` (production).

## Workflow

1. **Read current state** — list `sql/migrations/`, check highest number; grep schema for existing table/column names.
2. **Choose next number** — zero-padded 3 digits: `010_{short_description}.sql`.
3. **Write migration** — idempotent where practical (`IF NOT EXISTS`); one logical change per file.
4. **Update app layers** — `lib/data/*`, `lib/actions/*`, `types/*` in the same task (use **feature-scaffold**).
5. **Verify** — `pnpm db:migrate:status` then `pnpm db:migrate` against dev; never migrate main without explicit user request.

## Naming & conventions

| Item | Convention |
|------|------------|
| Files | `NNN_snake_case_description.sql` |
| Tables | `snake_case`, plural (`orders`, `course_registrations`) |
| Columns | `snake_case` (`created_at`, `deleted_at`, `customer_id`) |
| PKs | `UUID DEFAULT gen_random_uuid()` or existing pattern |
| Timestamps | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` |
| Soft delete | `deleted_at TIMESTAMPTZ NULL` + filter in queries |
| FKs | `REFERENCES parent(id) ON DELETE CASCADE` or `SET NULL` — choose explicitly |

## SELECT aliases in app code

DB stays snake_case; alias in data layer:

```sql
start_date as "startDate",
learning_objective as "learningObjective"
```

## Migration template

```sql
-- {One-line purpose in English}

CREATE TABLE IF NOT EXISTS example_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_example_items_status
  ON example_items(status)
  WHERE deleted_at IS NULL;
```

### Adding a column

```sql
ALTER TABLE items
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;
```

### Backfill (when needed)

```sql
UPDATE items SET status = 'active' WHERE status IS NULL;
ALTER TABLE items ALTER COLUMN status SET NOT NULL;
```

Split risky backfills into a separate migration file if large tables.

## Indexes

Add indexes for:

- Foreign keys used in JOINs/WHERE
- Columns filtered often (`status`, `slug`, `deleted_at`)
- Unique constraints (`UNIQUE (email, role)` pattern — see `003_users_email_per_role.sql`)

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm db:migrate` | Apply pending to default URL (`POSTGRES_URL`) |
| `pnpm db:migrate:dev` | Dev branch |
| `pnpm db:migrate:main` | Production — **only when user confirms** |
| `pnpm db:migrate:status` | Show applied migrations |

Migrations are tracked in `_schema_migrations` (managed by `scripts/migrate.ts`).

## Do not

- Edit migration files already applied to shared environments — add a new migration instead.
- Instantiate `postgres()` outside `lib/db.ts`.
- Put schema changes only in app code without a migration file.
- Drop columns/tables without user confirmation and a backup plan.

## Checklist before finishing

- [ ] Next sequential number, descriptive filename
- [ ] `IF NOT EXISTS` / safe reruns where appropriate
- [ ] FK and index strategy documented in SQL comment if non-obvious
- [ ] `lib/data` and `lib/actions` updated to match
- [ ] Soft-delete queries updated if `deleted_at` added

## Example invocation

User: *"Migration para agregar campo phone a customers"*

1. Create `010_customers_phone.sql` with `ADD COLUMN IF NOT EXISTS phone TEXT NULL`.
2. Update customer data/actions/types.
3. Report migrate command for dev.
