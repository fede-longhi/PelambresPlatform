---
name: auth-review
description: Reviews PelambresPlatform routes and server actions for authentication and authorization gaps. Use when adding protected routes, server actions, middleware changes, role-based features, OAuth flows, or password reset/token endpoints.
---

# Auth & Authorization Review

Audit and harden auth for PelambresPlatform's **admin** / **customer** / **public** model. Complements middleware in `auth.config.ts` — server actions need their own guards.

## When to run

- New or changed routes under `/admin`, `/customer`, `/login`, `/register`, `/set-password`
- New server actions that read/write sensitive data
- Features spanning roles (e.g. customer viewing only their orders)
- Token-based flows (password reset, registration confirmation)

## Architecture reference

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Middleware | `auth.config.ts` `authorized` callback | Route-level login, role, `mustChangePassword`, `hasPlatformAccess` |
| Permissions | `lib/auth/permissions.ts` | `canAccessAdmin`, `canAccessCustomer`, `hasRole` |
| Session | `auth.ts` + JWT callback | `role`, `isActive`, `mustChangePassword`, `hasPlatformAccess` |
| Action guards | `lib/actions/*` | Per-mutation checks — **required** even when middleware protects the page |
| Public routes | `lib/auth/public-routes.ts` | Logged-in redirects from `/login`, `/register` |

### Middleware rules (do not break)

- Allow `Next-Action` header requests through (server actions POST to page URLs).
- `/admin/*` → logged in, active, platform access, role `admin`, password changed.
- `/customer/*` → logged in, active, platform access, role `customer`, password changed.
- Wrong role → redirect to the other portal, not a generic 403.
- `mustChangePassword` → redirect to `/set-password` except on that route.

## Review workflow

1. **Map the surface** — list routes and server actions in scope.
2. **Route protection** — confirm path prefix matches `(admin)` or `(customer)` layout; public forms truly public.
3. **Action protection** — every mutation in `lib/actions/` must verify session + role (and ownership when applicable).
4. **Data scoping** — customer queries filter by `customer_id` / `user_id`; admin-only tables not exposed in public data functions.
5. **Token flows** — hashed storage, expiry, single-use (`used_at`), no user enumeration in error messages.
6. **Output** — findings table (severity, location, issue, fix).

## Server action guard patterns

### Admin-only (preferred helpers)

```typescript
import { auth } from '@/auth';
import { canAccessAdmin } from '@/lib/auth/permissions';

async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !canAccessAdmin({ /* map session fields */ })) {
    throw new Error('Unauthorized');
  }
  return user.id;
}
```

Also available: `requireAdminSessionUserId()` from `lib/data/user-data` (see `user-actions.ts`).

### Customer-scoped reads/writes

- Verify `canAccessCustomer(session.user)`.
- Load resource with `WHERE customer_id = ${sessionCustomerId}` — never trust client-supplied IDs alone.

### Public actions (registration, quote request)

- No session required.
- Rate-limit / validate input; no leaking whether an email exists in admin responses.
- Password reset: generic success message regardless of email found.

## Checklist

### Routes

- [ ] `/admin/*` inaccessible without admin role
- [ ] `/customer/*` inaccessible without customer role
- [ ] Inactive users (`isActive === false`) blocked
- [ ] Users without platform access blocked
- [ ] `mustChangePassword` forces `/set-password`
- [ ] OAuth / register / login redirects per `public-routes.ts`

### Server actions

- [ ] Each mutation calls auth guard (not UI-only hiding)
- [ ] Admin actions use `canAccessAdmin` or `requireAdminSessionUserId`
- [ ] Customer actions scope data to the session user's customer
- [ ] ID parameters validated (UUID/format) before queries
- [ ] No sensitive fields returned to wrong role

### Tokens & secrets

- [ ] Reset/confirmation tokens stored hashed
- [ ] Expiry enforced in query (`expires_at > NOW()`)
- [ ] Used tokens rejected (`used_at IS NULL`)
- [ ] Secrets only in env vars, never committed

## Severity guide

| Level | Example |
|-------|---------|
| **Crítico** | Mutation without session check; customer A reads customer B data |
| **Alto** | Missing `isActive` check in action; IDOR via predictable IDs |
| **Medio** | Inconsistent error messages enabling enumeration |
| **Bajo** | Redundant but harmless double checks |

## Do not

- Rely on hiding buttons/links as the only authorization.
- Add auth logic in pages — use middleware + action guards + `lib/auth/*`.
- Bypass `Next-Action` handling in middleware changes.

## Handoffs

- After fixing auth on a new feature, generate QA cases with **qa-manager** (auth domain in `domains.md`).
- For implementation scaffolding, use **feature-scaffold**.

## Example invocation

User: *"Review auth on the new customer profile edit action"*

1. Read action + data layer + route.
2. Verify customer session, customer_id scoping, validation.
3. Return findings table with concrete code fixes.
