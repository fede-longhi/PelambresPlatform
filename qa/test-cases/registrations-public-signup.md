# Inscripción a cursos — Casos de prueba

| Campo | Valor |
|-------|-------|
| **Dominio** | registrations |
| **Feature** | Inscripción pública y confirmación por email |
| **Generado** | 2026-07-02 |
| **Entorno** | Staging / local (`pnpm dev`) |

## Alcance

Flujo completo de inscripción desde el sitio público (`/education/{slug}`): formulario anónimo, usuario logueado, validaciones, cupos, confirmación por token y visibilidad en admin. Incluye curso gratuito y curso pago.

**Fuera de alcance:** edición de inscripciones en admin (ruta de edición referenciada pero no implementada — ver TC-REGISTRATIONS-008).

**Datos de staging sugeridos:** tener al menos un curso publicado con cupo disponible (`slug` anotado como `{slug-curso}`), uno gratuito (`price = 0`) y uno pago (`price > 0`).

---

## TC-REGISTRATIONS-001 — Inscripción exitosa como visitante anónimo

| | |
|---|---|
| **Prioridad** | Crítica |
| **Precondiciones** | Sin sesión iniciada. Curso publicado con cupos disponibles en `/education/{slug-curso}`. Email de prueba accesible (`qa-inscripcion+001@test.com`). |

**Pasos**

1. Ir a `/education` y abrir un curso publicado.
   - **Esperado:** Página del curso con título, descripción y panel lateral «¡Reservá tu lugar!».
2. Completar **Nombre completo**, **Correo electrónico** y opcionalmente **WhatsApp**.
   - **Esperado:** Campos visibles; WhatsApp marcado como opcional.
3. Clic en **Quiero inscribirme**.
   - **Esperado:** Mensaje «¡Inscripción recibida!» y texto indicando que se envió un correo de confirmación.
4. Revisar la bandeja del email usado.
   - **Esperado:** Email de confirmación con enlace al curso.

**Resultado esperado:** Inscripción creada en estado `pending` / pago `pending`. El usuario ve pantalla de éxito sin errores.

**Datos de prueba:** Nombre: `Ana QA Test` · Email: `qa-inscripcion+001@test.com` · WhatsApp: `+54 9 11 5555 0001`

---

## TC-REGISTRATIONS-002 — Validación de campos obligatorios (visitante anónimo)

| | |
|---|---|
| **Prioridad** | Alta |
| **Precondiciones** | Sin sesión. Curso publicado con cupos en `/education/{slug-curso}`. |

**Pasos**

1. Ir al formulario de inscripción del curso.
2. Dejar **Nombre completo** vacío e ingresar email inválido (`correo-sin-arroba`). Enviar el formulario.
   - **Esperado:** El navegador puede bloquear el envío por `required`/`type="email"`, o el servidor devuelve errores de validación.
3. Ingresar nombre de 2 caracteres (`Jo`) y email válido. Enviar.
   - **Esperado:** Error «El nombre debe tener al menos 3 caracteres.»
4. Ingresar nombre válido y email con formato inválido (`test@`). Enviar.
   - **Esperado:** Error «Ingresa un correo electrónico válido.» (o equivalente del navegador).

**Resultado esperado:** No se crea inscripción. Los mensajes de error son claros y en español.

**Datos de prueba:** Nombre corto: `Jo` · Email inválido: `test@`

---

## TC-REGISTRATIONS-003 — Confirmación por email (curso gratuito)

| | |
|---|---|
| **Prioridad** | Crítica |
| **Precondiciones** | Inscripción `pending` creada en curso con `price = 0`. Email de confirmación recibido con token válido. |

**Pasos**

1. Abrir el enlace del email de confirmación (`/education/{slug}/confirmation/{token}`).
   - **Esperado:** Pantalla «¡Inscripción Confirmada!» con mensaje de éxito.
2. Leer el bloque «¿Qué pasa ahora?».
   - **Esperado:** Indica iniciar sesión en el portal de cliente y acceder desde **Mis cursos**.
3. Clic en **Ir al portal de cliente** (si visible).
   - **Esperado:** Redirección a `/login?callbackUrl=/customer/courses`.
4. Iniciar sesión como customer con el mismo email de la inscripción y entrar a `/customer/courses`.
   - **Esperado:** El curso aparece listado con estado confirmado; acceso al aula habilitado (curso gratuito).

**Resultado esperado:** `registration_status = confirmed`. En curso gratuito, `payment_status = paid` automáticamente.

**Datos de prueba:** Usar email de TC-REGISTRATIONS-001 en curso gratuito.

---

## TC-REGISTRATIONS-004 — Confirmación por email (curso pago)

| | |
|---|---|
| **Prioridad** | Alta |
| **Precondiciones** | Inscripción `pending` en curso con `price > 0`. Token de confirmación válido sin usar. |

**Pasos**

1. Abrir el enlace de confirmación del email.
   - **Esperado:** Pantalla de éxito con mensaje de correo verificado y lugar reservado.
2. Leer «¿Qué pasa ahora?».
   - **Esperado:** Indica que se contactará por email/WhatsApp para instrucciones de pago; acceso al aula tras confirmar pago.
3. Ir a `/customer/courses` con sesión del mismo email.
   - **Esperado:** Curso listado como confirmado pero sin acceso al aula hasta pago (`payment_status` distinto de `paid`).

**Resultado esperado:** Inscripción confirmada; pago sigue pendiente. Mensaje de acceso restringido coherente con curso pago.

**Datos de prueba:** Curso pago de staging · Email dedicado `qa-inscripcion+pago@test.com`

---

## TC-REGISTRATIONS-005 — Reintento con email ya inscripto

| | |
|---|---|
| **Prioridad** | Alta |
| **Precondiciones** | Email `qa-duplicado@test.com` ya inscripto al mismo curso (estado `pending` o `confirmed`). Sin sesión o con sesión de otro usuario. |

**Pasos**

1. Ir al formulario de inscripción del mismo curso.
2. Completar con el **mismo email** ya registrado y enviar.
   - **Esperado:** Mensaje de error en banner rojo:
     - Si estaba `confirmed`: «Ya estás inscripto a este curso.»
     - Si estaba `pending`: «Ya tenés una inscripción pendiente. Revisá tu correo para confirmarla.»
3. Verificar en admin `/admin/courses/{id}/registrations`.
   - **Esperado:** Sigue existiendo una sola inscripción para ese email (no duplicado).

**Resultado esperado:** No se crea segunda inscripción.

**Datos de prueba:** Email duplicado: `qa-duplicado@test.com`

---

## TC-REGISTRATIONS-006 — Inscripción con usuario customer logueado

| | |
|---|---|
| **Prioridad** | Alta |
| **Precondiciones** | Usuario `customer` activo logueado, sin inscripción previa al curso. Nombre del perfil con al menos 3 caracteres. Curso con cupos. |

**Pasos**

1. Estando logueado, ir a `/education/{slug-curso}`.
   - **Esperado:** Formulario simplificado: muestra «Te inscribiremos como:» con nombre y email de la sesión (sin campos editables de nombre/email).
2. Clic en **Inscribirme a este curso**.
   - **Esperado:** Pantalla «¡Inscripción recibida!» y mensaje de email de confirmación.
3. Volver a cargar la página del curso antes de confirmar el email.
   - **Esperado:** Mensaje «Ya tenés una inscripción pendiente. Revisá tu correo para confirmarla.» (sin formulario de alta).

**Resultado esperado:** Inscripción vinculada al `user_id` del customer. Flujo sin reingresar datos manualmente.

**Datos de prueba:** Cuenta customer de staging con perfil completo.

---

## TC-REGISTRATIONS-007 — Curso sin cupos disponibles

| | |
|---|---|
| **Prioridad** | Media |
| **Precondiciones** | Curso publicado con `max_students > 0` y cantidad de inscripciones activas (`pending` + `confirmed`) igual al cupo máximo. |

**Pasos**

1. Ir a `/education/{slug-curso-lleno}`.
   - **Esperado:** Título del panel «Lista de espera» y texto sobre cupo máximo alcanzado.
2. Verificar el área de inscripción.
   - **Esperado:** Mensaje «Sin cupos disponibles por el momento.» — **no** se muestra el formulario.
3. Intentar acceder directamente vía API o manipulación del DOM para enviar inscripción.
   - **Esperado:** ⚠️ Verificar si el backend también bloquea altas con cupo lleno (gap potencial si solo se bloquea en UI).

**Resultado esperado:** Usuario no puede inscribirse desde la interfaz cuando el curso está lleno.

**Datos de prueba:** Curso configurado con cupo bajo (ej. `max_students = 1`) y una inscripción activa existente.

---

## TC-REGISTRATIONS-008 — Listado de inscripciones en admin

| | |
|---|---|
| **Prioridad** | Media |
| **Precondiciones** | Usuario `admin` logueado. Curso con al menos una inscripción de prueba. |

**Pasos**

1. Ir a `/admin/courses` y abrir un curso con inscriptos.
2. Clic en el contador de inscriptos o navegar a `/admin/courses/{id}/registrations`.
   - **Esperado:** Tabla con alumno, contacto, fecha, estado (`Pendiente` / `Confirmado` / `Cancelado`) y pago.
3. Verificar tarjetas de resumen (total, confirmados, pagos completados).
   - **Esperado:** Números coherentes con la tabla.
4. Clic en **Editar** de una inscripción.
   - **Esperado:** ⚠️ Gap detectado — la ruta `/admin/courses/{id}/registrations/{registrationId}/edit` está referenciada pero puede no existir. Documentar si devuelve 404.

**Resultado esperado:** Admin visualiza inscripciones correctamente. Reportar si el botón Editar falla.

**Datos de prueba:** Inscripciones de TC-001 a TC-006.

---

## TC-REGISTRATIONS-009 — Token de confirmación inválido o ya usado

| | |
|---|---|
| **Prioridad** | Media |
| **Precondiciones** | Token ya utilizado en confirmación previa, o token inventado. |

**Pasos**

1. Abrir `/education/{slug}/confirmation/token-inexistente-123`.
   - **Esperado:** Pantalla «Hubo un problema» con mensaje «El enlace de confirmación es inválido o ha expirado.»
2. Abrir nuevamente el **mismo enlace válido** de una inscripción ya confirmada.
   - **Esperado:** Pantalla de éxito indicando que el correo ya estaba verificado; no error destructivo.
3. Clic en **Volver al curso**.
   - **Esperado:** Redirección a `/education/{slug}`.

**Resultado esperado:** Tokens inválidos rechazados; re-uso de token confirmado manejado con mensaje amigable.

**Datos de prueba:** Token inválido: `00000000-0000-0000-0000-000000000000` (o el formato real del proyecto)

---

## TC-REGISTRATIONS-010 — Curso no publicado no accesible

| | |
|---|---|
| **Prioridad** | Media |
| **Precondiciones** | Curso existente en admin con `is_published = false` (borrador). Conocer su `slug`. |

**Pasos**

1. Ir directamente a `/education/{slug-borrador}`.
   - **Esperado:** Página 404 (curso no encontrado).
2. Verificar que el curso **no** aparece en el catálogo `/education`.
   - **Esperado:** Solo cursos publicados listados.

**Resultado esperado:** No es posible inscribirse a cursos en borrador desde el sitio público.

**Datos de prueba:** Slug de curso borrador creado en admin.
