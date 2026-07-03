# PelambresPlatform — Dominios para QA

Reference for scoping test cases. Admin paths require rol `admin`; customer portal requires rol `customer`.

| Dominio | Rutas clave | Flujos principales |
|---------|-------------|-------------------|
| **courses** | `/admin/courses`, `/education` | CRUD, publicar/borrador, slug |
| **registrations** | `/education/{slug}`, `/admin/courses/{id}/registrations` | Inscripción pública, estados, pago, confirmación |
| **orders** | `/admin/orders` | Crear/editar, estados, tracking, montos en centavos |
| **print-jobs** | `/admin/print-jobs` | Estados, modelos STL, gcode |
| **customers** | `/admin/customers` | CRUD, tipo persona/empresa |
| **users** | `/admin/users` | Roles admin/customer, contraseña temporal, soft delete |
| **auth** | `/login`, `/set-password` | Credentials, Google OAuth, reset password, selección de rol |
| **quote-requests** | `/admin/quote-requests`, formulario público | Lead + adjuntos |
| **configuration** | `/admin/configuration` | Key/value por categoría |
| **customer-portal** | `/customer` | Cursos, pedidos, perfil, cuenta sin vincular |
| **public** | `/`, `/education`, cotizador, guía de impresión | Marketing, navegación, responsive |

## Roles

- **Admin** — acceso a `/admin/*`
- **Customer** — acceso a `/customer/*`
- **Público** — sin sesión; formularios de inscripción y cotización

## Convenciones a verificar en casos

- Mensajes de validación en español (dominios educación/auth)
- Soft delete: registros eliminados no deben aparecer en listados
- Montos de pedidos almacenados en centavos en DB (verificar display en UI)
