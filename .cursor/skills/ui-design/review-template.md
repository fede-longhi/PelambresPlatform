# UI Review — {route or feature}

| Campo | Valor |
|-------|-------|
| **Superficie** | public / admin / customer / auth |
| **Rutas** | {paths reviewed} |
| **Fecha** | {YYYY-MM-DD} |
| **Modo** | review-only / review + fixes |

## Resumen

{1–2 oraciones: estado general y prioridad del trabajo restante.}

## Hallazgos

### Crítico

| # | Ubicación | Problema | Sugerencia |
|---|-----------|----------|------------|
| 1 | `{file or element}` | {what breaks UX, a11y, or mobile} | {concrete fix} |

### Mejora

| # | Ubicación | Problema | Sugerencia |
|---|-----------|----------|------------|
| 1 | | | |

### Opcional

| # | Ubicación | Problema | Sugerencia |
|---|-----------|----------|------------|
| 1 | | | |

## Checklist — Visual & UX

- [ ] Mobile ~375px — sin overflow, acciones usables
- [ ] Desktop ~1280px — layout correcto
- [ ] Tokens de marca (`primary`, `muted-foreground`, etc.)
- [ ] Tipografía consistente con la superficie (sans en público; `lusitana` en admin/auth)
- [ ] Estados: loading, vacío, error, validación
- [ ] Componentes reutilizables (no markup duplicado)
- [ ] Copy en español (es-AR) consistente con la superficie
- [ ] Tablas/formularios con estrategia mobile

## Checklist — Accesibilidad

- [ ] Un solo `h1` por página; jerarquía de headings sin saltos
- [ ] Todos los inputs con etiqueta visible (`Label` / `label` + `htmlFor`)
- [ ] Botones solo ícono con `aria-label` en español
- [ ] Íconos decorativos con `aria-hidden="true"`
- [ ] Errores de campo: `aria-invalid` + `aria-describedby` + texto visible
- [ ] Errores globales / alertas: anunciados (`role="alert"` o equivalente)
- [ ] Foco visible en todos los controles interactivos
- [ ] Navegación completa por teclado (Tab, Enter, Escape en diálogos)
- [ ] Estado no comunicado solo por color (texto o ícono + texto)
- [ ] Imágenes informativas con `alt` descriptivo en español
- [ ] Tablas: `th scope="col"`; alternativa mobile con la misma información
- [ ] Diálogos/menús Radix con título y cierre por Escape

## Referencias usadas

{Links o paths a páginas hermanas que sirvieron de benchmark.}
