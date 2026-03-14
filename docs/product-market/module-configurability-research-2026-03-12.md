# Pesquisa de mercado: módulos configuráveis no WorklyHub

Data: 12/03/2026

## Sinais de mercado observados

- Pequenas empresas que usam mais tecnologia e IA têm maior crescimento e expectativa de expansão, reforçando valor de sistemas adaptáveis por operação.
- SMBs reportam alto uso de apps conectados e valorizam automações em finanças/operações.
- Ferramentas líderes de field service destacam configuração de agenda, políticas de booking, capacidades da equipe, campos obrigatórios e permissões como diferenciais de adoção.

## Oportunidades por módulo (priorização)

### `schedule` (prioridade: alto)

- problema: regras de agenda variam por segmento (clínica, manutenção, beleza, etc.) e sem configuração aumenta retrabalho.
- feature: settings de agenda por workspace (duração padrão, período padrão, categoria padrão, validações obrigatórias e automação de seleção).
- persona: operação/dispatcher.
- valor esperado: menor tempo de criação de eventos e menor erro de preenchimento.
- mvp:
  - página `/schedule/settings`;
  - regras de defaults no modal de evento;
  - validações condicionais por workspace.
- modulos impactados: `schedule`.
- metrica de sucesso: redução do tempo médio para criar evento + aumento de eventos com dados completos.
- prioridade: alto.
- risco: excesso de regras rígidas se defaults não forem bem calibrados.

### `people` (prioridade: alto)

- problema: onboarding de colaboradores muda entre empresas e campos obrigatórios diferem por política interna.
- feature: settings de equipe por workspace (papel/departamento/salário padrão, campos obrigatórios e aba inicial do módulo).
- persona: gestor administrativo/RH operacional.
- valor esperado: cadastro mais rápido e padronizado.
- mvp:
  - página `/people/settings`;
  - aplicação dos settings no formulário de colaborador;
  - navegação inicial configurável (`employees` ou `capacity`).
- modulos impactados: `people`.
- metrica de sucesso: menor taxa de edição corretiva após criação.
- prioridade: alto.
- risco: defaults incorretos gerarem cadastros enviesados.

### `finance` (prioridade: médio)

- problema: cada empresa possui política própria de visão de caixa e agrupamentos.
- feature: settings de filtros e vistas padrão (range, groupBy, visão inicial).
- persona: gestor financeiro.
- valor esperado: leitura mais rápida de KPI relevante.
- mvp: defaults de dashboard financeiro por workspace.
- modulos impactados: `finance`.
- metrica de sucesso: maior uso de dashboards e menor navegação para chegar na visão-alvo.
- prioridade: médio.
- risco: conflitos com preferências individuais do usuário.

### `clients` (prioridade: médio)

- problema: comunicação com cliente (lembrantes/cadência/canais) muda por empresa.
- feature: settings de relacionamento (preferência de canal e cadência padrão).
- persona: atendimento/comercial.
- valor esperado: redução de no-show e melhora de retenção.
- mvp: preferências de comunicação por workspace + uso em fluxos de agendamento.
- modulos impactados: `clients`, `schedule`.
- metrica de sucesso: queda de faltas e aumento de retorno.
- prioridade: médio.
- risco: dependência de integrações externas de mensagens.

### `dashboard` (prioridade: médio)

- problema: KPI crítico muda por vertical.
- feature: cards e alertas configuráveis por prioridade do negócio.
- persona: dono/gestor.
- valor esperado: decisão mais rápida no painel principal.
- mvp: seleção de widgets e thresholds.
- modulos impactados: `dashboard`.
- metrica de sucesso: frequência de acesso e tempo de decisão.
- prioridade: médio.
- risco: sobrecarga de personalização sem guideline.

## Escopo aplicado nesta entrega (onda 1)

- `schedule`: settings implementado e aplicado no modal de eventos.
- `people`: settings implementado e aplicado no formulário de colaboradores + aba padrão.
