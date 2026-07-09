# Pelambres 3D — Brand & UI Reference

## Color tokens (`app/globals.css`)

Use semantic Tailwind classes — never raw hex in components.

| Token | Usage |
|-------|--------|
| `bg-primary` / `text-primary` | Brand purple-green, CTAs, accents, auth mobile logo bar |
| `text-primary-foreground` | Text on primary buttons |
| `bg-secondary` | Highlights (yellow accent) — sparingly |
| `text-muted-foreground` | Secondary copy, descriptions |
| `bg-destructive` | Destructive actions |
| `border-border`, `bg-background` | Cards, shells |

Header/sidebar CSS vars exist (`--header-background`, `--sidebar-*`) — use via existing layout components, not ad hoc.

## Logos & assets

| Asset | Path |
|-------|------|
| Main logo | `/pelambres_logo.svg` |
| Auth logo component | `PelambresAuthLogo` |
| Sidenav logo | `PelambresSidenavLogo` |

## Typography

- **Display / page titles**: `lusitana` from `@/app/fonts` — `className={lusitana.className}`
- **Body**: default sans (project font stack)
- **Scale**: `text-2xl` admin titles; `text-3xl md:text-5xl` public heroes; `text-sm` form labels

## Page archetypes

### Public landing (`app/page.tsx` pattern)

```tsx
<div className="flex min-h-screen flex-col bg-gray-100">
  <MainHeader user={headerUser} />
  <main className="space-y-20">
    <section className="bg-white pt-12 sm:pt-16 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* hero: grid lg:grid-cols-2, CTA rounded-full bg-primary */}
      </div>
    </section>
  </main>
  <MainFooter />
</div>
```

### Auth (`AuthPageShell`)

- Max width `max-w-[400px]`, `bg-gray-50` page
- Form in `AuthFormPanel` with `AuthFormTitle`, `AuthFormDescription`, `AuthFormError`
- Field labels: `authFieldLabelClassName`; inputs: `authFieldInputClassName` or shadcn `Input`

### Admin list (`app/(admin)/admin/orders/page.tsx` pattern)

- `h1` with lusitana + primary CTA link (`bg-primary`, `PlusIcon`)
- `Search` + `Suspense` + table skeleton + `Pagination`
- Table: `hidden md:table` + mobile alternative when wide

### Admin form

- shadcn `Button`, `Input`, `Label`, `Select`
- `useActionState` + server action; field errors from `*FormState.errors`
- Submit: `bg-primary text-primary-foreground`; disable while pending

### Customer portal

- Sidenav with `PelambresSidenavLogo` in `bg-primary` strip
- Dashboard cards with `text-primary hover:underline` links

## Component map

| Need | Look here first |
|------|-----------------|
| Buttons, inputs, dialogs | `@/components/ui/*` |
| Auth layout | `auth-page-shell`, `auth-form-panel` |
| Site chrome | `main-header`, `main-footer` |
| Loading | `@/components/shared/skeletons` |
| Domain-specific | `app/(admin)/admin/{domain}/_components/` or `components/{domain}/` |

## Interaction standards

- Touch targets ≥ 44px on mobile for primary actions
- Focus: visible outline on interactive elements
- Form validation: inline field errors + optional `AuthFormError` for global message
- Links to primary actions: `text-primary hover:underline`
- Destructive: `destructive` variant or explicit confirm dialog

## Copy (es-AR)

- **Public / customer guidance**: voseo — `Ingresá`, `Completá`, `Elegí`
- **Admin UI labels**: neutral — `Crear`, `Guardar`, `Eliminar`
- **Errors**: specific, actionable — not generic "Error"
- **Empty states**: explain what happened + one clear CTA

## Course slides (separate surface)

Reveal decks use dark `#0f172a` + blue `#2563eb` — see **course-slides** skill. Do not apply web marketing tokens to slide HTML.
