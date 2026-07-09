---
name: feature-scaffold
description: Scaffolds new PelambresPlatform features end-to-end following the lib/data + lib/actions + app routes pattern. Use when adding a new domain, admin CRUD, public form, customer portal section, or extending an existing feature with new routes and server actions.
---

# Feature Scaffold

Scaffold new features across data, actions, routes, and UI — following project rules (`lib-read-write.mdc`, `coding-standards.mdc`, `reusable-components.mdc`).

## Workflow

1. **Clarify scope** — domain name, entities, surfaces (admin / public / customer), CRUD vs read-only.
2. **Explore** — search `lib/data/`, `lib/actions/`, `app/(admin)/`, similar domains (orders, courses, customers).
3. **Plan file list** — present a short checklist (see [scaffold-checklist.md](scaffold-checklist.md)) before coding unless the user said "just build it".
4. **Implement bottom-up** — types/consts → migration (if needed, use **db-migration** skill) → data → actions → pages → components.
5. **Secure mutations** — admin actions need session checks (see **auth-review** skill).
6. **Finish** — suggest QA cases via **qa-manager**; UI polish via **ui-design** if public-facing.

Skip step 1 when the user named domain, routes, and entities.

## File layout by domain `{domain}`

```
types/{domain}-definitions.ts     # optional — enums, row types
lib/consts/{domain}-consts.ts     # status labels, allowed values
lib/data/{domain}-data.ts         # SELECT only — fetchX, fetchXById
lib/actions/{domain}-actions.ts   # 'use server' — create, update, delete
app/(admin)/admin/{domain}/
  page.tsx                          # list + search + pagination
  _components/{domain}-table.tsx
  create/page.tsx
  [id]/page.tsx
  [id]/edit/page.tsx
  _components/{domain}-form.tsx     # or create-form / edit-form
```

Public or customer routes go under `app/(public)/` or `app/(customer)/customer/` with the same `_components/` convention.

## Data layer (`lib/data/{domain}-data.ts`)

```typescript
import sql from '@/lib/db';

export async function fetchItems() {
  try {
    return await sql`
      SELECT id, title, status, created_at as "createdAt"
      FROM items
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch items.');
  }
}
```

- **Reads only** — no INSERT/UPDATE/DELETE.
- Alias columns to camelCase: `start_date as "startDate"`.
- Filter `deleted_at IS NULL` when the table uses soft delete.
- Paginated lists: `ITEMS_PER_PAGE`, `fetchFilteredX`, `fetchXPages` (see `order-data.ts`).

## Actions layer (`lib/actions/{domain}-actions.ts`)

```typescript
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from '@/lib/db';

const Schema = z.object({ /* fields with Spanish messages */ });

export type ItemFormState = {
  errors?: { /* field → string[] */ };
  message?: string | null;
  success?: boolean;
};

export async function createItem(_prev: ItemFormState, formData: FormData) {
  const validated = Schema.safeParse({ /* from formData */ });
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: '...' };
  }
  try {
    await sql`INSERT INTO items (...) VALUES (...)`;
  } catch (error) {
    return { message: 'Error de base de datos.' };
  }
  revalidatePath('/admin/items');
  redirect('/admin/items');
}
```

- Zod `safeParse` — return field errors, never throw on validation.
- User-facing messages in **Spanish (es-AR)**.
- `revalidatePath` after mutations; `redirect` when navigating away on success.
- Money stored in **centavos** in DB; convert on write/read (see `order-actions.ts`).
- Admin mutations: call `auth()` + `canAccessAdmin()` or `requireAdminSessionUserId()` from `lib/data/user-data`.

## Pages

- **Server Components** — fetch via `lib/data/*`, pass props to client forms.
- **Forms** — `'use client'` + `useActionState(action, initialState)`.
- **List page** — `searchParams` as `Promise<>` (Next.js 15), `Suspense` + skeleton, `Pagination`.
- **Metadata** — `export const metadata: Metadata = { title: '...' }`.

Reference implementations:

| Pattern | Reference |
|---------|-----------|
| Admin list | `app/(admin)/admin/orders/page.tsx` |
| Data + pagination | `lib/data/order-data.ts` |
| Create/update action | `lib/actions/order-actions.ts` |
| Admin-guarded upload | `lib/actions/course-material-actions.ts` |

## Types & consts

- Shared types: `types/definitions.ts` or `types/{domain}-definitions.ts`.
- Status enums + display labels: `lib/consts/{domain}-consts.ts` (export maps for UI badges).

## Naming

- Files: kebab-case (`order-actions.ts`, `orders-table.tsx`).
- Components: PascalCase exports.
- DB: `snake_case` columns; TypeScript: `camelCase`.

## Do not

- Query `sql` in pages or components.
- Create a second `postgres()` client.
- Put mutations in data files.
- Skip authorization on server actions that mutate data.

## Example invocation

User: *"Agregá admin CRUD para proveedores (suppliers)"*

1. Plan: migration, `supplier-data.ts`, `supplier-actions.ts`, `/admin/suppliers` routes.
2. Implement with soft delete, Spanish validation, admin session guard.
3. Reply with file list and suggest `qa-manager` cases for suppliers CRUD.
