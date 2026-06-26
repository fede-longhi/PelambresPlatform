---
name: course-slides
description: Generates Reveal.js HTML slide decks for PelambresPlatform courses from database course records. Use when the user asks to create, update, or regenerate slides, diapositivas, or presentations for a course.
---

# Course Slides (Reveal.js)

Generate self-contained HTML slide decks for courses in PelambresPlatform. Output is served at `/course-slides/{slug}/`.

## Workflow

1. **Resolve the course** — by slug, title, or admin URL (`/admin/courses/{id}`).
2. **Load course data** — query Postgres with the project's `sql` helper (`@/lib/db`). Match field names used in `app/(public)/education/[slug]/page.tsx`.
3. **Read the template** — `.cursor/skills/course-slides/reveal-template.html`.
4. **Write the deck** — `public/course-slides/{slug}/index.html` (create the folder if needed).
5. **Confirm** — tell the user the preview URL: `/course-slides/{slug}/` and the admin course page link.

## Fetching course data

```typescript
import sql from '@/lib/db';

const courses = await sql`
  SELECT
    id, title, slug,
    short_description as "shortDescription",
    duration, level,
    learning_objective as "learningObjective",
    learning_outcomes as "learningOutcomes",
    modality, start_date as "startDate",
    schedule, location, notes
  FROM courses
  WHERE slug = ${slug} AND deleted_at IS NULL
  LIMIT 1
`;
```

For admin lookup by ID, use `WHERE id = ${id}` instead. Unpublished courses are valid — slides are for instructors.

Label mapping: import `COURSE_LEVELS`, `COURSE_MODALITIES` from `@/lib/consts/course-consts`.

Parse outcomes: `learningOutcomes.split('\n').filter(line => line.trim())`.

## Slide deck structure

Build **12–20 slides** from DB fields only. Language: **Spanish (es-AR)**.

| # | Section | Source |
|---|---------|--------|
| 1 | Title — course name, Pelambres 3D, modality + level badges | `title`, labels |
| 2 | Agenda — 4–6 bullet overview of the session flow | derived from outcomes |
| 3 | ¿De qué se trata? — expand `shortDescription` | `shortDescription` |
| 4 | Objetivo de aprendizaje | `learningObjective` |
| 5–N | One slide per outcome — title = outcome text; 3–5 teaching bullets expanding the topic | `learningOutcomes` |
| N+1 | Logística — duration, schedule, location, start date | `duration`, `schedule`, `location`, `startDate` |
| N+2 | Notas del instructor (if `notes` present) | `notes` |
| Last | Cierre — recap bullets + contacto Pelambres 3D | derived |

When expanding outcomes into teaching bullets, stay faithful to the outcome text. Do not invent tools, prerequisites, or topics not implied by the course record. If content is thin, add generic facilitation slides (ejercicio práctico, discusión) rather than fabricated technical detail.

## HTML / Reveal.js rules

- Start from `reveal-template.html`; replace `{{PLACEHOLDERS}}` and inject `<section>` blocks inside `<div class="slides">`.
- **Self-contained**: Reveal.js via CDN only — no npm packages, no build step.
- **Branding**: dark header feel (`#0f172a` background, `#2563eb` accents). Logo: `/pelambres_logo.svg`.
- Each `<section>` is one slide. Use `<section>` with nested `<section>` only for vertical stacks when needed.
- Speaker notes: optional `<aside class="notes">` per slide for instructor prompts.
- Set `<html lang="es">` and `<title>{course title} — Pelambres 3D</title>`.

### Slide HTML patterns

```html
<!-- Title -->
<section data-background-color="#0f172a">
  <img src="/pelambres_logo.svg" alt="Pelambres 3D" style="height:48px;margin-bottom:1.5rem">
  <h1>Course Title</h1>
  <p class="subtitle">Modalidad · Nivel</p>
</section>

<!-- Content -->
<section>
  <h2>Section title</h2>
  <ul>
    <li>Bullet one</li>
  </ul>
</section>

<!-- Two-column when comparing concepts -->
<section>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;text-align:left">
    <div><h3>Left</h3><p>...</p></div>
    <div><h3>Right</h3><p>...</p></div>
  </div>
</section>
```

## File output

```
public/course-slides/{slug}/
  index.html    # required — the deck
```

Do not commit secrets. Slides are static HTML in `public/`.

## Updating existing decks

When regenerating, read the current `index.html` first. Preserve manual edits inside marked blocks if present:

```html
<!-- MANUAL:START --> ... <!-- MANUAL:END -->
```

Overwrite everything outside those blocks.

## Verification

After writing, confirm:
- File exists at `public/course-slides/{slug}/index.html`
- Slug in path matches DB `slug`
- All `learningOutcomes` lines have a corresponding content slide
- No empty `<section>` elements
