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