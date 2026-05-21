# README — Levantamiento técnico: integración CRM ↔ SILC

**Proyecto:** TFG — CRM Web a medida para Brooks Ambiental  
**Autora:** Brenda Lopes Ventura de Souza  
**Fecha:** mayo de 2026   

---

## Objetivo

Recopilar información técnica sobre el ERP interno de Brooks Ambiental (SILC) para tomar decisiones de arquitectura en el CRM del TFG.

La integración con el SILC está **fuera del alcance del MVP**. El objetivo de este levantamiento es que el CRM quede diseñado de forma compatible para que la integración sea viable en el futuro sin tener que rediseñar nada.

---

## Preguntas y respuestas

### Bloque 1 — Integración

| Pregunta | Respuesta |
|---|---|
| ¿El sistema permite integración con otros sistemas? | Sí. Arquitectura orientada a servicios (SOA). |
| ¿Existe API? | Sí. |
| ¿Es REST? | Sí. HTTP/HTTPS. |
| ¿Hay endpoint para crear una Orden de Servicio? | Sí. `POST /api/v1/ordens-servico` |
| ¿Qué formato de datos? | JSON. |
| ¿Cómo funciona la autenticación? | Token JWT. Soporta también API Key según el escenario. |
| ¿Hay documentación? | Sí. Swagger/OpenAPI con endpoints, payloads y ejemplos. |
| ¿Han integrado con otros sistemas antes? | Sí. Vía REST, ETL, webhooks y mensajería (colas). |

---

### Bloque 2 — Datos para crear una Orden de Servicio

Campos obligatorios en el SILC:

| Campo | Descripción |
|---|---|
| `cliente_id` | El cliente debe estar previamente cadastrado. |
| `tipo_residuo` | Clasificación del residuo. |
| `codigo_servico` | Código del servicio en el SILC. |
| `quantidade` + `unidade` | Estimación de volumen o peso. |
| `endereco` | Dirección completa (calle, número, ciudad, estado, CEP). |
| `data_execucao` | Fecha y hora programada. |
| `unidade_operacional` | Filial responsable de la ejecución. |

Ejemplo de payload:

```json
{
  "cliente_id": 12345,
  "tipo_residuo": "industrial",
  "codigo_servico": "COL-IND-001",
  "quantidade": 10,
  "unidade": "toneladas",
  "endereco": {
    "logradouro": "Rua Exemplo",
    "numero": "100",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "00000-000"
  },
  "data_execucao": "2026-05-10T08:00:00",
  "unidade_operacional": "Filial Sul"
}
```

El cliente debe existir antes de crear la OS. En escenarios controlados se puede crear simultáneamente vía endpoint específico.

---

### Bloque 3 — Infraestructura y problemas habituales

| Pregunta | Respuesta |
|---|---|
| ¿Dónde está alojado el sistema? | Cloud (AWS o Azure preferente). Admite híbrido u on-premise. |
| ¿Qué problemas hay habitualmente al crear una OS? | Datos incompletos, cliente no registrado, dirección inválida, fallo de autenticación, tipo de residuo incompatible con la unidad operacional, delays en integraciones asíncronas. |

---

## Decisiones de arquitectura derivadas

| Conclusión | Decisión tomada |
|---|---|
| API REST + JSON disponible | La capa de handover del CRM generará una estructura JSON compatible con el payload de la OS del SILC. |
| El cliente debe existir en el SILC | El CRM incluirá el campo `numero_registro_silc` en el modelo de datos del cliente. |
| Autenticación JWT | La arquitectura del CRM contemplará autenticación JWT para facilitar una integración futura alineada con SILC. |
| Campos obligatorios conocidos | El formulario de cierre validará obligatoriamente los campos que el SILC requiere antes de generar el handover. |
| Problemas frecuentes identificados | Se añaden validaciones específicas en el flujo de cierre para prevenir los errores más comunes señalados por el técnico. |

El handover de una oportunidad cerrada como "Ganada" generará un paquete estructurado (PDF + JSON) con todos los datos necesarios para crear la OS en el SILC, ya sea manualmente o, en el futuro, de forma automática vía API.

---

*Información proporcionada por el técnico responsable del ERP/SILC de Brooks Ambiental.*

## Nota de confidencialidad

Este documento recoge únicamente información técnica general necesaria para el diseño académico del TFG. No incluye credenciales, datos reales de clientes, información sensible ni documentación interna completa del sistema.