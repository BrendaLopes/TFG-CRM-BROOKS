# Reunión - Validación del modelo de dominio

## Objetivo

Validar el modelo del dominio y la estructura del proceso comercial a partir del análisis previo y del diagrama de clases propuesto.

## Participantes

- Equipo Brooks Ambiental
- Brenda Lopes

## Conclusiones principales

### 1. Pipeline Comercial — Fases definidas

O processo comercial foi confirmado nas seguintes fases:
 
| Fase | Descrição |
|---|---|
| **LEAD** | Registro do contato inicial (ativo ou passivo) |
| **QUALIFICAÇÃO** | Análise de prioridade, validação de interesse + entrevista técnica |
| **ELABORAÇÃO DE PROPOSTA** | Formulário de cotação com dados pré-preenchidos da entrevista |
| **PROPOSTA ENVIADA** | Envio formal ao cliente, registro de data e responsável |
| **NEGOCIAÇÃO** | Histórico de interações, ajustes na proposta |
| **FECHADO** | Ganado (contrato/eventual formalizado) ou Perdido (com motivo) |
 
> **Decisão de design:** A entrevista técnica **não é uma fase independente do Kanban** — é uma tarefa estruturada dentro da Qualificação. O pipeline mostra estados da oportunidade, não ações internas do comercial.
 
---

### 2. Entrevista Técnica — Campos confirmados
 
Durante a qualificação, o comercial registra os seguintes dados com o cliente:
 
- **Tipo de serviço:** Eventual ou Contrato recorrente
  - Se contrato: frequência (1x/semana, quinzenal, mensal, a cada X dias...)
- **Tipo de resíduo** (permite múltiplos)
- **Acondicionamento** (a granel, ensacado, tambor, caixa, pallet, etc.)
- **Quantidade/peso estimado** (por resíduo)
- **Volume estimado** (por resíduo)
- **Endereço** do ponto de coleta
- **Acesso e restrição de horários**
- **Observações complementares**
---


 
### 3. Formulário de Cotação — Lógica de funcionamento
 
- Os dados da entrevista técnica **pré-preenchem os campos correspondentes** do formulário de cotação.
- O comercial pode **alterar qualquer campo** pré-preenchido.
- Campos que dependem de julgamento do comercial chegam **em branco**.
- O sistema **sugere um preço** com base nos dados tabelados (tipo de resíduo, quantidade, distância...).
- O comercial pode **aceitar o preço sugerido ou sobrescrever** com valor diferente.
- **O sistema registra ambos:** preço sugerido e preço final aplicado.
> **Decisão de negócio:** A precificação é **altamente subjetiva**. Exemplo discutido: uma entrega próxima pode demorar mais que uma entrega distante por causa do trânsito. O sistema sugere; o comercial decide.
 
---

### 5. Configurabilidade do Sistema
 
- Os **preços tabelados** (por tipo de resíduo, unidade, distância) devem ser **alteráveis pelo Administrador** sem intervenção técnica.
- Os **campos do formulário de cotação** também devem ser **configuráveis pelo Administrador**.
- Isso permite adaptar o sistema à medida que as regras de negócio evoluem.
---
 
### 6. Acúmulo de Dados para Análise Futura
 
- O sistema deve registrar **todos os dados desde o início**, incluindo leads que nunca avançam.
- Isso permitirá no futuro extrair métricas como: taxa de conversão por fase, motivos de perda mais frequentes, clientes recorrentes sem avanço, etc.
- **Não é uma funcionalidade do MVP** — mas os dados devem estar estruturados para suportá-la.
---

## Impacto en el modelo

El modelo actual es consistente con el proceso real.

Se identifican ajustes:

- Incluir variables de distancia y tiempo en la solicitud de servicio
- Reflejar en requisitos la configuración de formularios y precios