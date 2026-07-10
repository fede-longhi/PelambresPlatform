# UI Review — Customer profile: user vs customer fields

| Campo | Valor |
|-------|-------|
| **Superficie** | customer |
| **Rutas** | `/customer/profile` |
| **Fecha** | 2026-07-10 |
| **Modo** | review-only (deferred analysis) |

## Resumen

En el perfil unificado se muestran campos de `users` y `customers` juntos. Cuando hay solapamiento, la UI prioriza el valor del **usuario**. Queda pendiente decidir si esos datos deben sincronizarse, cuál es la fuente de verdad, y qué puede editar el cliente.

## Hallazgos

### Mejora

| # | Ubicación | Problema | Sugerencia |
|---|-----------|----------|------------|
| 1 | `/customer/profile` — email | `users.email` y `customers.email` pueden diferir. Hoy se muestra solo el email del usuario. | Analizar: ¿deben ser siempre iguales? ¿quién puede cambiar cada uno? ¿impacto en pedidos, cotizaciones y OAuth? |
| 2 | `/customer/profile` — nombre | `users.first_name` / `last_name` vs `customers.first_name` / `last_name` / `name` (empresa). La UI edita solo el usuario; el cliente vinculado no se actualiza. | Definir si el nombre de persona en customer debe espejar al user, o si customer es solo dato comercial/facturación. |
| 3 | `/customer/profile` — teléfono | Solo existe en `customers`. Se edita desde el perfil y actualiza el customer vinculado. | Confirmar que el teléfono del customer es el canal correcto de contacto (vs un teléfono a nivel user si se agrega después). |
| 4 | `/customer/profile` — dirección | `customers.address` con autocomplete de Google Places (New) vía `/api/places/*` y `GOOGLE_PLACES_API_KEY`. | Habilitar Autocomplete (New) + Place Details en Google Cloud si aún no están. Evaluar si hace falta `place_id` / lat-lng para logística. |

### Opcional

| # | Ubicación | Problema | Sugerencia |
|---|-----------|----------|------------|
| 1 | Header avatar / session | Tras cambiar foto o nombre, la sesión JWT puede quedar desactualizada hasta el próximo login. | Evaluar `update()` de NextAuth o leer avatar/nombre desde DB en `getMainHeaderUser`. |

## Notas de implementación actual

- Campos mostrados (fuente): foto (`users`), nombre/apellido (`users`), email (`users`), teléfono (`customers`), tipo/empresa (`customers`), métodos de acceso (`users`).
- Editables hoy: nombre, apellido, teléfono, foto de perfil.
- No editables: email, tipo de cliente, nombre de empresa.
