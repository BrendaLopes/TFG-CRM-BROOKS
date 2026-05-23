# DEVLOG — Brooks CRM

Registro de decisiones y avances del desarrollo del MVP.
Usado como base para redactar el Capítulo 4 del TFG.

---

## Setup inicial del backend

**Estado:** ✅ Completado

### Decisiones tomadas
- Stack confirmado: Node.js + Express + TypeScript + Prisma 6 + PostgreSQL
- Se eligió Prisma 6 sobre Prisma 7 por estabilidad y coherencia 
  con lo documentado en el cap. 3
- PostgreSQL corre en Docker local (puerto 5432)
- Backend corre con nodemon + ts-node en puerto 3000

### Lo que funciona
- Servidor Express arrancado y respondiendo en `/health`
- Schema completo de Prisma aplicado a la BD (migración `init`)
- Todas las tablas creadas: Usuario, Lead, Cliente, Oportunidad,
  SolicitudServicio, Cotizacion, Propuesta, OrdenServicio, Residuo, TarifaBase

### Estructura creada
app/backend/
├── prisma/
│   ├── schema.prisma      ← modelo completo del dominio
│   └── migrations/        ← migración init aplicada
└── src/
    ├── lib/prisma.ts      ← cliente Prisma singleton
    ├── index.ts           ← servidor Express
    ├── controllers/
    ├── services/
    ├── routes/
    └── middleware/

### Próximo paso
Implementar autenticación JWT (registro + login de usuarios)

## Autenticación JWT

**Estado:** ✅ Completado

### Lo que funciona
- POST /api/auth/registrar — crea usuario con password hasheado (bcrypt)
- POST /api/auth/login — devuelve token JWT con expiración 8h
- Middleware verificarToken — protege rutas privadas

### Decisiones tomadas
- Roles manejados como enum en BD: CAPTACION, COMERCIAL, ADMINISTRADOR
- Token incluye id y rol del usuario para control de acceso por ruta
- Expiración del token: 8 horas (sesión de trabajo diaria)

### Próximo paso
CRUD de Leads — primer flujo del ciclo comercial (CU-01 / CU-02)

---

## CRUD de Leads (CU-01 / CU-02)

**Estado:** ✅ Completado

### Endpoints implementados
- POST /api/leads — crea lead, detecta posibles duplicados por nombre de empresa
- GET /api/leads — lista todos los leads con usuario y cliente asociado
- GET /api/leads/:id — detalle de un lead con oportunidad asociada
- PUT /api/leads/:id — actualiza datos del lead

### Decisiones tomadas
- Detección de duplicados: búsqueda case-insensitive por nombreEmpresa
- Respuesta incluye flag `posibleDuplicado` para alertar al usuario en el frontend
- Todas las rutas protegidas con middleware verificarToken

### Próximo paso
CRUD de Clientes + conversión Lead → Oportunidad (CU-03)

---

## Clientes y Pipeline de Oportunidades (CU-03)

**Estado:** ✅ Completado

### Endpoints implementados
- POST /api/clientes — crea cliente con datos fiscales
- GET /api/clientes — lista clientes con contactos
- GET /api/clientes/:id — detalle con oportunidades asociadas
- PUT /api/clientes/:id — actualiza cliente
- POST /api/clientes/:id/contactos — añade contacto a cliente
- POST /api/oportunidades — convierte lead en oportunidad (estado inicial: LEAD)
- GET /api/oportunidades — devuelve pipeline completo con datos de lead, cliente y usuario
- GET /api/oportunidades/:id — ficha completa con historial, solicitud, propuestas y OS
- PATCH /api/oportunidades/:id/estado — avanza estado en el pipeline
- POST /api/oportunidades/:id/interacciones — registra interacción con el cliente

### Decisiones tomadas
- La oportunidad se crea siempre en estado LEAD
- El cierre automático registra fechaCierre cuando el estado es GANADA, PERDIDA o NO_VIABLE
- El pipeline devuelve solo la última versión de propuesta por oportunidad

### Próximo paso
Solicitud de servicio + cotización asistida (CU-04 / CU-05 / CU-06)

---

## Solicitud de Servicio y Cotización Asistida (CU-04 / CU-05 / CU-06)

**Estado:** ✅ Completado

### Endpoints implementados
- POST /api/cotizaciones/residuos — crea residuo en catálogo
- GET /api/cotizaciones/residuos — lista residuos activos con tarifas
- POST /api/cotizaciones/tarifas — crea tarifa base
- GET /api/cotizaciones/tarifas — lista tarifas activas
- POST /api/cotizaciones/solicitudes — registra datos técnicos del servicio con ítems
- POST /api/cotizaciones/solicitudes/:id/cotizar — genera cotización con precios sugeridos
- GET /api/cotizaciones/:id — obtiene cotización completa
- PATCH /api/cotizaciones/:id/items/:itemId/precio — ajuste manual con justificación

### Lógica de cotización verificada
- Precio sugerido = precioUnitario × cantidad
- Si cantidad > franquiciaMinima: primeras N kg a precio base, excedente a precioExcedente
- Ejemplo verificado: 800 kg, franquicia 500, precio 0.45, excedente 0.38 → R$339
- Items sin tarifa configurada se marcan como ajusteManual=true

### Próximo paso
Generación de propuesta PDF (CU-07) y orden de servicio (CU-09/10)