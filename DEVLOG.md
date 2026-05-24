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

---

## Evolución del modelo — campos editables en Propuesta

**Estado:** ✅ Completado

### Cambios respecto al diseño original (cap. 3)
El modelo Propuesta del cap. 3 no incluía campos editables por el comercial.
Durante la implementación se identificó la necesidad de los siguientes campos adicionales:

**Modelo Propuesta — campos añadidos:**
- observaciones: String? — texto libre para condiciones especiales
- condicionesPago: String? — condiciones de pago específicas del cliente
- validadeDias: Int (default 5) — validez de la propuesta en días
- nombreFirmante: String? — nombre del comercial que firma
- cargoFirmante: String? — cargo del firmante

### Impacto en el TFG
- ⚠️ El DER del cap. 3 (Figura 26) debe actualizarse con estos campos
- ⚠️ El schema.prisma referenciado en el cap. 3 queda actualizado automáticamente

### Justificación
El comercial necesita personalizar cada propuesta con datos que no existen
en el sistema (firmante, condiciones específicas). Esto refleja el proceso
real de Brooks donde cada propuesta tiene particularidades comerciales.

---

## Cambios a reflejar en el Capítulo 3 del TFG

### Modelo Propuesta — campos añadidos respecto al diseño original
El DER del cap. 3 (Figura 26) debe actualizarse con estos campos:
- observaciones: String? 
- condicionesPago: String? (default: 'Prazo de faturamento 30 dias')
- validadeDias: Int (default: 5)
- nombreFirmante: String?
- cargoFirmante: String?

### Nuevo endpoint no documentado en cap. 3
- PATCH /api/propuestas/:id — permite al comercial editar campos
  de la propuesta antes de generar el PDF (condiciones pago,
  validez, firmante, observaciones)

### Relación nueva
- Usuario → Propuesta (1 a muchos) — no estaba en el DER original

### Justificación
El proceso real de Brooks requiere que el comercial personalice
condiciones de pago y validez propuesta a propuesta antes de enviar.

---

## PDF Propuesta — versión final (CU-07)

**Estado:** ✅ Completado

### Lo que funciona
- Logo SVG real de Brooks incrustado inline
- Sello ISO 9001
- Estructura idéntica a la propuesta real de Brooks Ambiental
- Campos dinámicos: condicionesPago, validadeDias, nombreFirmante, cargoFirmante
- Flujo: crear propuesta → editar campos (PATCH) → generar PDF
- Valor Transporte y Valor Destino Final calculados correctamente

### Próximo paso
CU-09/10 — Cerrar oportunidad y generar Orden de Servicio PDF

---

## Cierre de Oportunidad y Orden de Servicio (CU-09/10)

**Estado:** ✅ Completado

### Endpoints implementados
- PATCH /api/propuestas/oportunidades/:id/cerrar — cierra oportunidad
  como GANADA, PERDIDA o NO_VIABLE. Si GANADA genera OS automáticamente
- GET /api/propuestas/ordenes/:id/pdf — exporta orden de servicio en PDF

### Lo que funciona
- Cierre registra fechaCierre automáticamente
- Generación automática de OS al cerrar como GANADA
- PDF con datos del cliente, servicio, frecuencia y unidad operacional
- Todos los campos son dinámicos excepto el nombre de la empresa

### Pendiente / mejora futura
- unidadeOperacional está hardcodeada como 'Filial Palhoça'
  Debería ser configurable por el administrador

### Próximo paso
Seed de datos reales (catálogo Brooks) cuando llegue el Excel con precios
+ arrancar con el frontend

---

## Frontend — Setup inicial (Login + Auth)

**Estado:** ✅ Completado

### Lo que funciona
- Vite + React + TypeScript + Tailwind configurados
- Cliente HTTP con axios — proxy hacia backend en puerto 3000
- Contexto de autenticación — token y usuario en localStorage
- Login con validación y manejo de errores
- Rutas protegidas — redirige a /login si no autenticado
- Logout funcional

### Estilo visual adoptado
- Referencia: sistema SILC de Brooks (rojo corporativo, tablas funcionales)
- CRM adopta paleta más limpia para contexto comercial
- Verde oscuro como color principal (diferencia del rojo operativo del SILC)

### Próximo paso
Pipeline Kanban — pantalla principal del sistema

---

## Pipeline Kanban (CU-03)

**Estado:** ✅ Completado

### Lo que funciona
- Tablero Kanban con 8 columnas de estados
- Tarjetas con nombre del cliente, tipo de contrato, responsable y prioridad
- Contador de oportunidades activas y ganadas
- Datos reales desde la API
- Identidad visual Brooks — rojo corporativo, tipografía limpia

### Próximo paso
Formulario de registro de lead (CU-01) y ficha de oportunidad
---

## Seed de datos de prueba

**Estado:** ✅ Completado

### Lo que incluye
- 2 usuarios: Ana Comercial (ADMINISTRADOR) y André Toro (COMERCIAL)
- 8 clientes de distintos segmentos (alimenticio, industrial, farmacéutico, etc.)
- 8 oportunidades distribuidas en los estados del pipeline:
  LEAD, CUALIFICADA, PROPUESTA_EN_ELABORACION, PROPUESTA_ENVIADA,
  EN_NEGOCIACION, PERDIDA — más la de Frigorífico Bela Vista en GANADA

### Pendiente
- Seed del catálogo real de residuos y tarifas (pendiente Excel de Brooks)