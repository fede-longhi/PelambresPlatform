---
name: qa-manager
description: Designs manual QA test cases for PelambresPlatform. Use when the user asks to create, generate, or update QA test cases, test plans, casos de prueba, or QA documentation for QAs to execute.
---

# QA Manager

Design **manual test cases** for human QAs to execute against PelambresPlatform. Output is markdown files in `qa/` — not app code, not database changes.

## Workflow

1. **Clarify scope** — domain (see [domains.md](domains.md)), feature or flow, and how many cases (default: 5–8).
2. **Explore the codebase** — read routes, actions, and forms for the scoped area before writing cases. Base steps on real URLs, fields, and status values.
3. **Write test cases** — one file per batch in `qa/test-cases/`.
4. **Confirm** — tell the user the file path and a one-line summary of what was covered.

Skip step 1 when the user already named the domain and feature.

## Output location

```
qa/
  test-cases/
    {domain}-{feature-slug}.md    # e.g. courses-registration.md
```

Create `qa/test-cases/` if it does not exist. Use kebab-case slugs. If a file already exists, read it first and **append** new cases under a dated heading rather than overwriting.

## Test case format

Use [test-case-template.md](test-case-template.md). Every case must be executable by a QA without reading source code.

### Required fields per case

| Field | Rule |
|-------|------|
| **ID** | `TC-{DOMAIN}-{NNN}` — e.g. `TC-COURSES-001` |
| **Título** | Short, action-oriented (Spanish es-AR) |
| **Prioridad** | `Crítica` / `Alta` / `Media` / `Baja` |
| **Precondiciones** | Roles, data, and environment state before starting |
| **Pasos** | Numbered; each step = one user action + expected UI response |
| **Resultado esperado** | Final observable outcome |
| **Datos de prueba** | Concrete values (emails, amounts, statuses) when relevant |

### Coverage rules

For each scoped feature, include at minimum:

- **Happy path** — main success flow
- **Validation** — at least one invalid input or missing required field
- **Authorization** — wrong role or unauthenticated access (when applicable)
- **Edge case** — empty state, duplicate, or boundary (when applicable)

Do not invent features that are not in the codebase. If something is missing or broken, add a case with note `⚠️ Gap detectado` in precondiciones.

## Language

- Test case content: **Spanish (es-AR)**
- File names and IDs: English kebab-case / uppercase codes

## Exploring before writing

Match project conventions:

| Area | Where to look |
|------|---------------|
| Admin routes | `app/(admin)/admin/` |
| Public routes | `app/(public)/` |
| Customer portal | `app/(customer)/customer/` |
| Mutations | `lib/actions/` |
| Status enums | `lib/consts/` |
| Auth rules | `auth.config.ts` |

## Example invocation

User: *"Generá casos de prueba para inscripción a cursos"*

1. Read `app/(public)/education/`, `lib/actions/course-actions.ts`, registration consts.
2. Write `qa/test-cases/registrations-public-signup.md` with 6–8 cases covering signup, validation, confirmation, and duplicate email.
3. Reply with file path and coverage summary.

## Updating existing plans

When the user asks to extend or refresh cases:

1. Read the existing `qa/test-cases/*.md` file.
2. Add cases under `## Casos agregados — {YYYY-MM-DD}` or update outdated steps inline.
3. Renumber IDs only for new cases; do not renumber existing IDs.

## What this skill does NOT do

- No automated test code (Playwright, Jest, etc.)
- No changes to `app/`, `lib/`, or database
- No test execution tracking — QAs run cases manually and report outside this repo
