# Conclusiones

## Cumplimiento de objetivos

Este trabajo tenía como objetivo general desarrollar un sistema web tipo CRM a medida para Brooks Ambiental que permitiera gestionar de forma organizada y trazable el ciclo comercial, desde la captación de leads hasta la generación de propuestas y su traspaso estructurado al área de operaciones. La solución desarrollada satisface este objetivo, cubriendo el ciclo comercial completo en sus diez casos de uso principales.

Los tres objetivos específicos planteados en el capítulo 1 se han cumplido de la siguiente manera:

**Objetivo específico 1 - Disciplina de requisitos.**

Se ha realizado el levantamiento y especificación completa de los requisitos funcionales y no funcionales del sistema. El modelo del dominio, los diagramas de estado, el diagrama de contexto, los casos de uso con criterios de aceptación y los requisitos de usuario forman un conjunto coherente y trazable que ha guiado el desarrollo de la solución. Los requisitos se han definido a partir del análisis del proceso real de Brooks Ambiental, lo que ha permitido modelar la complejidad específica del negocio: la estructura de precios con valor de transporte, valor de destino final y precio por excedente, y las particularidades del catálogo de residuos.

**Objetivo específico 2 - Disciplina de análisis y diseño.**

Se ha definido la solución a nivel conceptual y técnico, incluyendo el diagrama de clases de análisis, los diagramas de secuencia de los casos de uso representativos, el modelo de datos en sus versiones lógica y física, la arquitectura cliente-servidor en tres capas, los diagramas de despliegue para los entornos de desarrollo y producción, y el diseño de la integración futura con el sistema SILC. Las decisiones de diseño documentadas en el DEVLOG del proyecto demuestran que la implementación posterior es un refinamiento coherente del diseño, no una desviación.

**Objetivo específico 3 - Prototipo funcional.**

Se ha implementado un MVP funcional que cubre los diez casos de uso clasificados como Must en la priorización MoSCoW. El sistema incluye el pipeline tipo Kanban con drag & drop y validación de transiciones, la gestión completa de oportunidades con edición inline, el formulario estructurado de recogida de datos, la cotización asistida con ajuste manual de precios y justificación obligatoria, la generación de propuestas con versioning, y la orden de servicio en PDF estructurada conforme a los campos del sistema SILC.

## Discusión de resultados

### La cualificación como decisión estructurada

Durante el desarrollo surgió la necesidad de replantear el diseño inicial de la sección de cualificación. En el diseño original se contemplaban dos campos de texto libre (notas de cualificación y criterios de viabilidad). Al implementar esta funcionalidad y contrastarla con el proceso real, se identificó que la cualificación no es un proceso de anotación, sino una decisión binaria: el lead es viable o no lo es. Modelarla como texto libre habría reproducido el mismo problema de falta de estandarización que existe en el proceso actual.

La solución adoptada: radio button de viabilidad, selector de prioridad y campo de motivo condicional, es funcionalmente más restrictiva pero semánticamente más correcta. Este tipo de decisiones, en las que el diseño inicial se ajusta durante la implementación a partir del conocimiento más profundo del dominio, ilustra el valor de la metodología iterativa adoptada.

### La cotización regenerable como patrón de consistencia

Otro punto relevante fue la decisión de implementar la cotización como regenerable: cuando el comercial modifica los datos del servicio tras haber generado una cotización, el sistema elimina la cotización anterior y calcula una nueva. Esta decisión implica que no se acumulan versiones de cotización, solo de propuesta.

La alternativa habría sido versionar también la cotización, lo que habría añadido complejidad al modelo sin un beneficio claro para el MVP. La trazabilidad de los ajustes de precio queda garantizada por el campo justificacionAjuste en cada ítem de cotización, lo que satisface el requisito de auditoría sin necesidad de versionar el documento completo.

### Drag and drop con validación de transiciones

La implementación del drag & drop en el pipeline requirió una decisión de diseño no anticipada: dónde validar las transiciones de estado. La opción inicial era validar únicamente en el backend (al recibir el PATCH). Se optó por validar también en el frontend, codificando la misma matriz de transiciones válidas que define el diagrama de estados del capítulo 2. Esta redundancia tiene un propósito concreto: proporcionar feedback inmediato al usuario sin necesidad de una petición al servidor, mejorando la experiencia de uso especialmente en conexiones lentas.

### Limitaciones del MVP

El MVP presenta limitaciones conocidas que se han aceptado conscientemente dado el alcance del trabajo:

El catálogo de residuos y tarifas se ha poblado con datos de prueba. El catálogo real de Brooks Ambiental, que incluye aproximadamente 150 tipos de residuos, requiere un proceso de importación con los precios definitivos que el equipo de la empresa completará en una fase posterior.

El precio de transporte del servicio se gestiona actualmente de forma manual a través del campo de precio en la cotización. En el proceso real, este precio depende parcialmente de la distancia entre la dirección del cliente y las instalaciones de Brooks. Una evolución natural del sistema sería integrar una API de geolocalización para calcular esta distancia automáticamente y sugerirla como componente del precio.

La integración con SILC, aunque diseñada a nivel técnico en el apartado 3.7, no se ha implementado en el MVP. La orden de servicio en PDF proporciona la información necesaria de forma estructurada, pero el traspaso sigue requiriendo introducción manual en el sistema operativo.

Los casos de uso CU-11 (Gestionar tarifas base) y CU-12 (Configurar formulario), clasificados como Must y Could respectivamente, han quedado fuera del alcance del MVP. La gestión de tarifas puede realizarse directamente en la base de datos durante la fase inicial, y su interfaz de usuario se plantea como primer incremento tras el MVP.

## Recomendaciones y futuras líneas de actuación

A partir de los resultados obtenidos y las limitaciones identificadas, se proponen las siguientes líneas de desarrollo para la evolución del sistema:

Integración con SILC.

El diseño técnico de la integración está completo (apartado 3.7). El siguiente paso es implementar el SilcIntegrationService para enviar el payload JSON al endpoint POST /api/v1/ordens-servico de SILC en el momento del cierre de la oportunidad como ganada. El campo numeroRegistroSilc en el modelo Cliente y los campos de OrdenServicio ya están preparados para este mapeo.

Panel de administración de tarifas.

CU-11 es el caso de uso de mayor impacto operativo en el corto plazo, ya que sin tarifas configuradas el sistema no puede sugerir precios. Se recomienda implementar la interfaz de gestión del catálogo de residuos y tarifas como primer incremento tras el MVP, utilizando la API ya disponible (POST /api/cotizaciones/residuos y POST /api/cotizaciones/tarifas).

Cálculo automático de distancia.

La integración con la API de Google Maps o con la API de Mapbox permitiría calcular automáticamente la distancia entre la dirección del cliente y las instalaciones de Brooks Ambiental, incorporando este valor como componente del precio sugerido en la cotización.

Gestión de múltiples contactos por cliente.

El modelo de datos soporta múltiples contactos por cliente, pero la interfaz actual solo expone el contacto principal. Una evolución natural es ampliar la sección de contacto para gestionar todos los interlocutores de una cuenta.

Dashboard de métricas comerciales.

La información acumulada en el pipeline (estados, tiempos entre fases, tasas de conversión, motivos de pérdida) permite construir un cuadro de mandos que ofrezca visibilidad sobre el rendimiento comercial del equipo. Todos los datos necesarios están ya almacenados en la base de datos.

Despliegue en producción.

El entorno de producción está diseñado (frontend en Vercel, backend y base de datos en Railway) y puede desplegarse directamente desde el repositorio de GitHub. Este paso haría el sistema accesible al equipo de Brooks Ambiental para su uso real.

## Reflexión final

El desarrollo de este trabajo ha permitido aplicar de forma integrada las disciplinas de la ingeniería del software: requisitos, análisis, diseño e implementación, sobre un problema real con complejidad propia. La especificidad del negocio de gestión de residuos, con su lógica de cotización particular y sus restricciones operativas, ha exigido en varios momentos revisar o ajustar las decisiones de diseño iniciales, lo que ilustra la naturaleza iterativa del proceso de desarrollo de software y justifica la adopción de RUP como metodología.

El resultado es una base funcional y documentada sobre la que el equipo de Brooks Ambiental puede apoyarse para mejorar el control de su proceso comercial, reducir la dispersión de información y estandarizar la generación de propuestas. La trazabilidad entre los requisitos del capítulo 2, el diseño del capítulo 3 y la implementación del capítulo 4 garantiza que cualquier evolución futura del sistema pueda abordarse con una comprensión clara de las decisiones tomadas y sus justificaciones.

