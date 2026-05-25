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

## [fecha de hoy] — Sprint frontend: interactividad core

### Cambios implementados

**OportunidadPage.tsx**
- Añadido botón "← Volver al pipeline" en cabecera (navigate('/'))
- Implementada edición inline por secciones independientes:
  - Sección "Dados básicos": nombre, empresa, canal, responsável
  - Sección "Contacto": nome, telefone, email
  - Sección "Qualificação": notasQualificacao, criteriosViabilidade
- Cada sección tiene su propio estado de edición (solo una activa a la vez)
- PATCH /api/oportunidades/:id por sección con feedback inline (sin alert)
- Correcciones previas: error handling en carga, bug NO_VIABLE, 
  historial undefined, useAuth no usado

**PipelinePage.tsx**
- Implementado drag & drop con @dnd-kit/core
- Matriz de transiciones válidas codificada según diagrama de estados del modelo
- Estados finales (GANADA, PERDIDA, NO_VIABLE) no arrastrables
- Feedback visual: borde azul (válido) / rojo (inválido) en columna destino
- Actualización optimista local + PATCH /api/oportunidades/:id
- Snap back si PATCH falla
- Click (< 8px) sigue navegando a ficha de oportunidad
- Toast de error 2s si transición no permitida

### Decisiones de diseño
- Edición inline elegida sobre modal: permite ver el contexto 
  de la oportunidad mientras se edita
- activationConstraint { distance: 8 } para distinguir click de drag
- Transiciones validadas en frontend Y backend para coherencia 
  con el modelo de dominio

### Impacto en cap. 3
- CU-02 (Actualizar lead) y CU-03 (Gestionar oportunidad) 
  quedan cubiertos por la edición inline
- La matriz TRANSICIONES_VALIDAS implementa exactamente 
  el diagrama de estados de la oportunidad (§3.2.2)

  ## [fecha] — Fix registro lead + tarjeta pipeline

- handleSubmitLead encadena POST /leads → POST /clientes → 
  POST /clientes/:id/contactos → POST /oportunidades
  para que el lead aparezca inmediatamente en el pipeline
- Tarjeta en estado LEAD muestra "Pendente qualificação" 
  en lugar del tipo de contrato (que aún no se conoce)

### Impacto cap. 3
- CU-01 queda completamente cubierto end-to-end

## [fecha] — Sprint cotización completo

### Cambios backend
- Migración: EN_ENTREVISTA_TECNICA → EN_RECOGIDA_DE_DATOS en enum EstadoOportunidad
- Migración: añadido campo motivoNoViable en Oportunidad
- Nuevo endpoint PUT /api/cotizaciones/solicitudes/:id para editar solicitud existente
- Fix actualizarOportunidad: crea contacto si no existe (antes solo actualizaba)

### Cambios frontend
- OportunidadPage: sección "Dados do serviço" visible en todos los estados 
  posteriores a EN_RECOGIDA_DE_DATOS
- OportunidadPage: handleGuardarServicio distingue crear vs actualizar solicitud
- OportunidadPage: sección Cotização con generación automática y ajuste por ítem
- Fix PrivateRoute: condición de carrera con localStorage al recargar página
- Seed: 8 residuos y tarifas de prueba añadidos al catálogo

### CU cubiertos
- CU-04: Recoger datos del servicio ✅
- CU-05: Generar cotización ✅  
- CU-06: Ajustar precios de cotización ✅
- CU-07: Generar propuesta (parcial — falta vista edición antes de PDF) ✅

### Impacto cap. 3
- La cualificación fue rediseñada de texto libre a decisión estructurada
  (viable/no viable + prioridad) — más alineado con el modelo de dominio
- El flujo POST solicitud → cotización automática → ajuste manual implementa
  exactamente el modelo de precificación descrito en §3.1

## [fecha] — Modal edición propuesta (CU-07 completo)
- Botón "Editar" en sidebar de propuestas abre modal
- Campos editables: condicionesPago, validadeDias, nombreFirmante, 
  cargoFirmante, observaciones
- PATCH /api/propuestas/:id + recarga oportunidad
- PDF genera con los datos actualizados
- CU-07 Generar propuesta: COMPLETO ✅

## 2026-05-25 — Sprint frontend completo: pipeline → cierre

### Backend — cambios acumulados

**Schema y migraciones:**
- Migración: `EN_ENTREVISTA_TECNICA` → `EN_RECOGIDA_DE_DATOS` en enum EstadoOportunidad
- Migración: campo `motivoNoViable String?` añadido a modelo Oportunidad
- Seed: 8 residuos de prueba + tarifas base con precios aleatorios

**Nuevos endpoints:**
- `PATCH /api/oportunidades/:id` — actualiza datos básicos, contacto, 
  prioridad, motivoNoViable (service con múltiples operaciones paralelas)
- `PUT /api/cotizaciones/solicitudes/:id` — edita solicitud existente 
  (borra items anteriores y crea nuevos)

**Fixes:**
- `actualizarOportunidad`: crea contacto si no existe (antes solo actualizaba)
- `obtenerOportunidadPorId`: include cotizacion dentro de solicitudServicio
- `generarCotizacion`: borra cotización existente antes de regenerar 
  (evita error de unique constraint)
- `actualizarOportunidad` en `actualizarOportunidad service`: 
  include cotizacion en el return final

**PDF Orden de Servicio:**
- Rediseñado con logo SVG Brooks, colores corporativos #b61b24
- Secciones con título en rojo, grid 2 columnas
- Referencia a propuesta comercial
- Dos bloques de firma (operacional + cliente)
- Badge ISO 9001

### Frontend — cambios acumulados

**AuthContext / App.tsx:**
- Fix condición de carrera en PrivateRoute: añadido estado `checking` 
  para esperar que useEffect lea localStorage antes de redirigir a login

**PipelinePage:**
- `handleSubmitLead` encadena: POST /leads → POST /clientes → 
  POST /clientes/:id/contactos → POST /oportunidades
  Lead ahora aparece inmediatamente en columna LEAD del Kanban
- Tarjeta en estado LEAD muestra "Pendente qualificação" en lugar del tipo
- Badges de prioridad: ALTA (rojo), MEDIA (amarillo), BAJA (oculto)
- Fix duplicado: `{ force: true }` en reenvío con catch

**OportunidadPage — features nuevas:**
- Botón "← Volver al pipeline" en cabecera
- Edición inline por secciones (basicos, contacto, cualificación)
- Sección Qualificação rediseñada: radio Viable/No viable + select prioridad 
  + textarea motivo (solo si no viable) — al guardar cambia estado automáticamente
- Sección "Dados do serviço": formulario con tipo, frecuencia, dirección, 
  restricciones, lista de residuos con cantidad y unidad; visible en todos 
  los estados >= EN_RECOGIDA_DE_DATOS
- Sección "Cotização": tabla con residuo/cantidad/unidad/precio sugerido/
  precio final ajustable con justificación obligatoria si modifica
- Botón "Gerar proposta" abre modal prellenado con usuario logado
- Botón "Editar" en cada propuesta del sidebar
- Botón "+ Nova versão" genera nueva propuesta sin borrar la anterior
- Modal de cierre: GANADA (confirma + genera OS automáticamente) y 
  PERDIDA (motivo obligatorio)
- PDF de propuesta y OS via axios blob (sin exponer token en URL)

**OportunidadPage — fixes:**
- Fix tabla cotización: campos correctos (descripcion, cantidad, unidad)
- Fix sección datos servicio: visible también en PROPUESTA_EN_ELABORACION+
- Fix handleGuardarServicio: PUT si existe solicitud, POST si es nueva
- Fix contacto: crea si no existe al guardar sección contacto

### CU completados
- CU-01 Registrar lead ✅
- CU-02 Actualizar lead ✅
- CU-03 Gestionar oportunidad ✅
- CU-04 Recoger datos del servicio ✅
- CU-05 Generar cotización asistida ✅
- CU-06 Ajustar precios de cotización ✅
- CU-07 Generar propuesta + edición + PDF ✅
- CU-08 Registrar interacciones ✅
- CU-09 Cerrar oportunidad (ganada/perdida) ✅
- CU-10 Generar orden de servicio + PDF ✅

### Decisiones de diseño registradas
- Cualificación como decisión estructurada (no texto libre): alineado 
  con el modelo de dominio — viable/no viable es una decisión binaria, 
  no una nota
- Drag & drop con validación de transiciones en frontend: la matriz 
  TRANSICIONES_VALIDAS implementa exactamente el diagrama de estados §3.2.2
- Cotización regenerable: borrar y recrear es más simple que versionar 
  items individuales para el MVP
- Nueva versión de propuesta sin borrar anteriores: permite trazabilidad 
  del historial de negociación
- PDF via blob: evita exponer JWT en URL del navegador
- Precio de transporte y tipo de contenedor: dejados fuera del MVP, 
  documentados como mejoras futuras en conclusiones del TFG

### Impacto en capítulos del TFG
- Cap. 3 §3.1: el flujo AS-IS → TO-BE queda demostrado end-to-end
- Cap. 3 §3.2.2: el diagrama de estados de la oportunidad está 
  implementado fielmente (TRANSICIONES_VALIDAS en PipelinePage)
- Cap. 4: todas las pantallas principales tienen implementación 
  funcional para capturas
- Cap. 4 §5.4: la arquitectura cliente-servidor con JWT está operativa
- Conclusiones: mencionar precio por km y tipo de contenedor como 
  trabajo futuro