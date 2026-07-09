# Accessibility Reference (PelambresPlatform)

Target: **WCAG 2.1 Level AA** where practical. Stack: shadcn/Radix, Tailwind, Spanish (es-AR) UI.

## Baseline (every interactive UI)

| Requirement | Pattern |
|-------------|---------|
| Page language | Root layout sets `lang="es"` |
| Visible labels | Every input has a `<Label htmlFor>` or `<label htmlFor>` — never placeholder-only |
| Icon-only controls | `aria-label` in Spanish (e.g. `aria-label="Cerrar"`) |
| Decorative icons | `aria-hidden="true"` on Heroicons/Lucide beside visible text |
| Focus visible | Do not remove outlines; use `focus-visible:ring-2 focus-visible:ring-ring` on custom controls |
| Touch targets | ≥ 44×44px on mobile for buttons/links (see `responsive-ui.mdc`) |
| Color contrast | Body text on white: `text-gray-900` / `text-foreground`; muted: `text-muted-foreground` only for secondary copy, not essential labels |
| Motion | Respect `prefers-reduced-motion` for large animations (optional; flag if added) |

## Forms

### shadcn admin forms

```tsx
<div className="space-y-2">
  <Label htmlFor="title">Título</Label>
  <Input
    id="title"
    name="title"
    aria-invalid={!!errors?.title}
    aria-describedby={errors?.title ? 'title-error' : undefined}
  />
  {errors?.title && (
    <p id="title-error" className="text-sm text-destructive" role="alert">
      {errors.title[0]}
    </p>
  )}
</div>
```

### Auth forms (`auth-form-panel` pattern)

- `htmlFor` + matching `id` on native `<input>` (see `login-form.tsx`).
- Global form error: `AuthFormError` — ensure message is announced (`role="alert"` on the container).
- Submit: `disabled={isPending}`; avoid relying only on `aria-disabled` without `disabled`.
- Success/info banners (e.g. password set): prefer `role="status"` for non-blocking messages.

### Checkboxes / switches

- Use shadcn `Checkbox` + `Label` with shared `id`/`htmlFor`, or Radix label wrapping.
- Group related options with `fieldset` + `legend` when ≥ 2 related choices.

## Buttons & links

```tsx
// Icon-only
<Button variant="ghost" size="icon" aria-label="Eliminar pedido">
  <Trash2 className="h-4 w-4" aria-hidden="true" />
</Button>

// Link styled as button — use Link or Button as appropriate; real `<button>` for actions
<Link href="/admin/orders">Ver pedidos</Link>
```

- Destructive actions: confirm in `AlertDialog`; trap focus inside (Radix Dialog handles this).
- Loading state: `disabled` + visible text change (`Guardando…`); optional `aria-busy="true"` on form.

## Tables (admin lists)

- Desktop `<table>`: `<th scope="col">` for column headers.
- `hidden md:table` desktop table **must** have a mobile alternative with the same information (cards/list), not only hidden data.
- Sortable columns: `aria-sort="ascending" | "descending" | "none"` when implemented.
- Row actions: accessible name per row (`aria-label={`Editar pedido ${code}`}`).

## Navigation

- One `<h1>` per page; heading levels do not skip (`h1` → `h2` → `h3`).
- `MainHeader` / sidenav: current page indicated visually **and** with `aria-current="page"` on active nav link where applicable.
- Skip link to main content: recommended for public pages with long headers (optional improvement).

## Dialogs, menus, popovers

Radix primitives (`Dialog`, `DropdownMenu`, `Popover`) provide focus trap and Escape to close — verify:

- Trigger is a real `<button>` (or `Button`).
- `DialogTitle` and `DialogDescription` are present (can be visually hidden with `sr-only` if needed).
- Do not nest interactive elements incorrectly inside menu items.

## Images

```tsx
<Image src="..." alt="Impresora 3D en taller Pelambres" width={...} height={...} />
```

- Informative images: descriptive `alt` in Spanish.
- Decorative: `alt=""` or `aria-hidden` on SVG icons.
- Logo in header: `alt="Pelambres 3D"` (or component default).

## Dynamic content

| Situation | Pattern |
|-----------|---------|
| Validation error after submit | `role="alert"` on error text |
| Success toast | shadcn Toast (Radix) — already live-region friendly |
| Loading table | Skeleton + `aria-busy="true"` on region, or visible "Cargando…" text |
| Empty state | Heading + short description; CTA is a real link/button |

## Review severity (a11y)

| Level | Examples |
|-------|----------|
| **Crítico** | No label on required field; keyboard trap; icon-only button without name; information only by color |
| **Mejora** | Missing `aria-invalid`/`describedby`; weak focus ring; table without mobile equivalent |
| **Opcional** | Skip link; `aria-live` polish; enhanced sort indicators |

## Quick keyboard test

1. Tab through all interactive elements — logical order, visible focus.
2. Activate buttons/links with Enter/Space.
3. Close dialogs with Escape.
4. Complete a form submit with keyboard only.

## Do not

- `tabIndex={0}` on non-interactive elements to fake focusability.
- `onClick` on `<div>` without `role`, `tabIndex`, and keyboard handler — use `<button>` or `Button`.
- Disable zoom (`user-scalable=no`).
- Use color alone for status — pair with text or icon + text (e.g. badge label).
