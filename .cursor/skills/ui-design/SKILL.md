---
name: ui-design
description: Designs and reviews PelambresPlatform UI/UX and accessibility for public, admin, and customer surfaces. Use when the user asks to design a screen, improve UX, review UI consistency, audit responsive layout, check accessibility or a11y, or evaluate visual polish of pages and components.
---

# UI Design & UX Review

Design new screens and review existing UI against Pelambres 3D brand and project conventions. Output is **implementation guidance** (and optional code changes when asked) — not separate design files unless the user requests mockups.

## Modes

| Mode | Trigger | Output |
|------|---------|--------|
| **Design** | "design", "mock up", "layout for", new page/flow | Component tree, Tailwind classes, copy (es-AR), states |
| **Review** | "review UI", "audit", "check responsive", "a11y", PR/diff | Markdown review using [review-template.md](review-template.md) |

Clarify scope if missing: **surface** (public / admin / customer / auth), **route**, and whether to **propose code** or **review only**.

## Before designing or reviewing

1. Read the target page and sibling routes for the same surface.
2. Search `components/shared/`, `components/layout/`, and the route's `_components/` for reusable pieces.
3. Apply rules: `responsive-ui.mdc`, `reusable-components.mdc`, `design-system.mdc`.
4. Brand tokens and surface patterns: [brand-reference.md](brand-reference.md).
5. Accessibility patterns: [a11y-reference.md](a11y-reference.md).

## Design workflow

1. **Pick archetype** — landing, auth, admin list, admin form, customer dashboard, public form, content page (see brand-reference).
2. **Compose from existing pieces** — prefer `AuthPageShell`, `AuthFormPanel`, `MainHeader`, shadcn `@/components/ui/*`.
3. **Define states** — loading (Suspense/skeleton), empty, error, success, validation errors on fields.
4. **Mobile-first layout** — stack at `default`, enhance at `md:` / `lg:`; no horizontal overflow at ~375px.
5. **Copy in Spanish (es-AR)** — voseo for public/auth (`Ingresá`, `Completá`); neutral professional for admin labels.
6. **Accessibility** — labeled inputs, keyboard path, focus visible, icon `aria-label`s; see [a11y-reference.md](a11y-reference.md).
7. **Implement** — Server Components by default; `'use client'` only for hooks/interactivity.

## Review workflow

1. Open the page(s) or diff; compare with 1–2 reference pages on the same surface.
2. Walk the rubric in [review-template.md](review-template.md) including the accessibility section.
3. Apply [a11y-reference.md](a11y-reference.md) — keyboard order, labels, ARIA, tables, dialogs.
4. Classify findings: **Crítico** (broken UX/accessibility), **Mejora** (inconsistency), **Opcional** (polish).
5. For each finding: location, issue, suggested fix (concrete class/component/ARIA attribute).
6. If asked to fix: apply minimal diffs; do not redesign unrelated areas.

## Surface quick reference

| Surface | Shell | Typography | Tone |
|---------|-------|------------|------|
| Public | `MainHeader` + `MainFooter`, `max-w-7xl mx-auto` | Sans headings + `text-primary` accents | Confident, approachable, voseo |
| Auth | `AuthPageShell` + `AuthFormPanel` | `lusitana` titles via `AuthFormTitle` | Clear, reassuring, voseo |
| Admin | Admin layout sidenav | `lusitana` page `h1`, utilitarian tables/forms | Neutral, precise |
| Customer | Customer sidenav, `bg-primary` logo strip | Same as admin, warmer CTAs | Helpful, voseo in guidance text |

## Do not

- Introduce new color palettes outside CSS variables in `app/globals.css`.
- Add MUI or new UI libraries — shadcn + Tailwind only.
- Hard-code desktop-only widths without a mobile strategy.
- Duplicate markup that exists in `components/shared/` — extend or compose instead.

## Handoffs

- After designing a new flow, suggest QA cases: invoke **qa-manager** skill.
- After scaffolding admin CRUD, invoke **feature-scaffold** if backend layers are also needed.

## Example invocations

- *"Review the login and forgot-password UI for consistency and a11y"* → review mode, auth surface, visual + accessibility checklist.
- *"Design the empty state for customer orders"* → design mode, customer portal, reuse existing card/empty patterns.
