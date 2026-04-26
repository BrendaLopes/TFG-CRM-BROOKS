## 3.1 Descripción del proceso actual (AS-IS) y proceso objetivo (TO-BE)

### 3.1.1 Proceso actual (AS-IS)

El proceso comercial actual de Brooks Ambiental comienza con la captación de un cliente potencial y finaliza con el traspaso del servicio al área de operación.

![AS-IS](../diagramas/img/AS-IS.png)

La captación del lead puede producirse a través de distintos canales, como llamadas, WhatsApp o contacto directo del equipo comercial. Esta información no se registra en un sistema centralizado, lo que provoca dispersión de datos y falta de visibilidad del estado real de las oportunidades.

Una vez recibido el contacto, el comercial evalúa la viabilidad del servicio. En caso necesario, solicita información adicional al cliente, como tipo de residuo, cantidad estimada, ubicación o condiciones de acceso. Esta recogida de información se realiza de forma no estructurada y depende del criterio individual de cada comercial.

La elaboración de la propuesta es manual. El precio se define combinando referencias informales de tarifas con la experiencia del comercial, teniendo en cuenta factores como la distancia o el tiempo de recogida. Este proceso no deja registro del cálculo ni de las decisiones tomadas.

Durante la negociación, las interacciones con el cliente se realizan a través de canales externos y no quedan registradas. Finalmente, la oportunidad se cierra como ganada o perdida. En caso de éxito, la información se transfiere al área de operación de forma no estructurada.

#### Limitaciones del proceso actual

| Problema | Impacto |
|----------|--------|
| Falta de registro centralizado | Pérdida de información y baja visibilidad del pipeline |
| Información no estructurada | Propuestas inconsistentes |
| Cotización manual | Dificultad para controlar precios y márgenes |
| Sin historial de negociación | Pérdida de contexto comercial |
| Traspaso a operación informal | Riesgo de errores en la ejecución |

#### Entradas y salidas del proceso

| Entradas | Salidas |
|---------|--------|
| Solicitudes de clientes | Propuesta comercial |
| Información del residuo | Resultado (ganado/perdido) |
| Datos del cliente | Información para operación |


---

### 3.1.2 Proceso objetivo (TO-BE)

El proceso objetivo introduce una gestión estructurada del ciclo comercial mediante un sistema CRM.

![TO-BE](../diagramas/img/to-be.png)

A diferencia del proceso actual, cada oportunidad se registra desde el primer contacto y avanza a través de estados definidos, garantizando trazabilidad completa en todas las fases.

Todo contacto se registra como un lead, independientemente del canal de entrada. A partir de ahí, el comercial decide si el lead se convierte en una oportunidad viable.

Una vez cualificada, el comercial recoge la información del servicio mediante un formulario estructurado dentro del sistema. Estos datos incluyen tipo de servicio, frecuencia, tipo de residuo, cantidad estimada, ubicación y condiciones de acceso.

A partir de esta información, el sistema genera una cotización asistida. El cálculo combina tarifas predefinidas (por ejemplo, asociadas a residuos o servicios logísticos) con variables contextuales como la distancia o condiciones específicas del servicio. El sistema propone un precio, pero el comercial puede ajustarlo, quedando registrados tanto el valor sugerido como el valor final.

La cotización sirve como base para la generación de la propuesta comercial. Durante la negociación, la propuesta puede modificarse y todas las interacciones quedan registradas en el sistema.

El proceso finaliza con el cierre de la oportunidad como ganada, perdida o no viable. En caso de éxito, la información se transfiere al área operativa de forma estructurada.

# 3.2 Modelo de dominio

El modelo del dominio representa los principales conceptos del proceso comercial y las relaciones entre ellos, proporcionando una abstracción del funcionamiento del negocio independiente de la implementación técnica.

Este modelo permite identificar las entidades clave implicadas en la gestión comercial y en la generación asistida de propuestas, sirviendo como base para el diseño posterior del sistema.

---

## 3.2.1 Diagrama de clases del dominio
El diagrama representa la estructura conceptual del proceso comercial, organizando las entidades en tres bloques: el pipeline comercial, el proceso de cotización y el catálogo de tarifas.

![Diagrama de clases del dominio](../diagramas/img/clases.png)  
*Figura X — Diagrama de clases del dominio*

Una decisión importante del modelo es separar la solicitud de servicio 
de la cotización. La solicitud recoge los datos técnicos del cliente 
durante la cualificación y esos mismos datos sirven de base para 
generar la cotización, sin que ambas cosas queden mezcladas. De forma 
similar, la cotización y la propuesta son entidades distintas, lo que 
permite ajustar o versionar la propuesta sin tocar el cálculo original.

Respecto a los precios, el modelo permite que un mismo residuo tenga 
tarifas diferentes según el destino final, algo que refleja cómo 
funciona realmente la precificación en este tipo de negocio.

## 3.2.2 Diagramas de estados

Se presentan dos diagramas de estados que complementan el modelo de clases, 
mostrando el comportamiento dinámico de las entidades más relevantes del proceso comercial.

### Estado de la Oportunidad

El diagrama recoge el ciclo de vida completo de una oportunidad dentro del sistema, 
desde el registro inicial del contacto hasta su cierre. Una oportunidad puede 
descartarse como no viable en dos momentos distintos: tras la evaluación inicial 
del lead, o después de la entrevista técnica, cuando el comercial determina que 
el servicio no puede ejecutarse. En caso de avanzar, la oportunidad pasa por la 
elaboración y envío de la propuesta, pudiendo entrar en un ciclo de negociación 
antes de cerrarse como ganada o perdida.

![Estado de la Oportunidad](../diagramas/img/estados_oportunidad.png)
*Figura X — Diagrama de estados de la Oportunidad*

### Estado de la Propuesta

El diagrama muestra el ciclo de vida de una propuesta comercial una vez generada. 
Desde el borrador inicial puede enviarse al cliente, quien puede aceptarla, 
rechazarla o solicitar cambios. En este último caso la propuesta entra en revisión, 
desde donde puede generar una nueva versión o descartarse directamente.

![Estado de la Propuesta](../diagramas/img/estados_propuesta.png)
*Figura X — Diagrama de estados de la Propuesta*