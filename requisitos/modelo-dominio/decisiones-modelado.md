# Decisiones de modelado del dominio

Este documento recoge las principales decisiones tomadas en el diseño del modelo de dominio del sistema.

---

## 1. Separación entre Cotización y Propuesta

Se ha decidido diferenciar explícitamente entre los conceptos de **cotización** y **propuesta**, ya que representan fases distintas dentro del proceso comercial.

- **Cotización**:  
  Representa el cálculo interno generado por el sistema a partir de la información introducida por el usuario y las reglas de cotización definidas.  
  No es visible directamente por el cliente.

- **Propuesta**:  
  Representa el documento comercial que se envía al cliente, basado en una cotización.  
  Puede ser modificada manualmente por el usuario antes de su envío.

Esta separación permite:
- Mantener la trazabilidad entre cálculo automático y decisión comercial.
- Permitir ajustes manuales sin perder el valor de la generación asistida.
- Gestionar versiones de propuestas durante la negociación.

---

## 2. Introducción de la entidad Solicitud de Servicio

Se incorpora la entidad **SolicitudServicio** como mecanismo para estructurar la recogida de información necesaria para la cotización.

Esta entidad:
- Recoge los datos técnicos del servicio solicitado (tipo de residuo, frecuencia, volumen, etc.).
- Se compone de uno o varios ítems (`ItemSolicitud`).
- Sirve como entrada al proceso de generación de cotización.

Esta decisión permite:
- Estandarizar la captura de información.
- Adaptar formularios según el tipo de servicio.
- Reducir errores y ambigüedad en la definición del servicio.

---

## 3. Generación asistida de precios

El sistema incorpora un mecanismo de generación automática de precios basado en:

- Tipo de servicio
- Tipo de residuo
- Tipo de cliente
- Frecuencia
- Cantidad

A partir de estos parámetros:
- Se aplican **reglas de cotización**
- Se genera una **cotización sugerida**

El usuario puede posteriormente:
- Revisar
- Ajustar manualmente los valores
- Confirmar la propuesta final

---

## 4. Separación entre cálculo automático y decisión comercial

Se ha diseñado el sistema para distinguir claramente entre:

- **Resultado generado por el sistema (cotización)**
- **Decisión final del usuario (propuesta enviada)**

Esto permite:
- Mantener control y flexibilidad comercial
- Evitar dependencia total del sistema
- Garantizar trazabilidad de los cambios realizados

---

## 5. Gestión del ciclo de vida de la oportunidad

Se define un flujo de estados controlado para la entidad **Oportunidad**:

- Lead
- Oportunidad cualificada
- Propuesta en elaboración
- Propuesta enviada / en negociación
- Ganada
- Perdida
- No viable

Este modelo permite:
- Estandarizar el proceso comercial
- Mejorar la visibilidad del estado de cada oportunidad
- Facilitar el análisis del pipeline

---

## 6. Trazabilidad del proceso comercial

Se incorpora la entidad **HistorialSeguimiento**, asociada a la oportunidad, para registrar:

- Interacciones con el cliente
- Cambios durante la negociación
- Comentarios relevantes
- Próximas acciones

Esto permite:
- Mantener un histórico completo del proceso comercial
- Evitar pérdida de información
- Mejorar la toma de decisiones

---

## 7. Generación de servicio a partir de oportunidad ganada

Cuando una oportunidad se marca como **ganada**:

- Se genera una entidad **OrdenServicio**
- Se registra la información necesaria para el área operativa

Esto asegura:
- Un traspaso estructurado a operaciones
- Continuidad entre proceso comercial y ejecución del servicio

---

## 8. Exclusión de integración con sistemas externos

En esta fase del proyecto:

- No se contempla integración directa con sistemas externos (ej. SILC)

El sistema se centra en:
- La gestión interna del proceso comercial
- La generación asistida de propuestas

Esto permite:
- Reducir la complejidad inicial
- Focalizar el alcance del sistema