# WorklyHub Agents

Este repositorio organiza instrucoes de agents em `agents/`.

Onde encontrar instrucoes

- Index principal: `agents/index.json` (nao precisa abrir os arquivos para descobrir).
- Instrucoes gerais: `agents/instructions/*.instructions`.
- Instrucoes por modulo: `agents/instructions/modules/*.instructions`.

Como usar

- Fluxo principal: `core-delivery-flow` em `agents/index.json`.
- Ordem obrigatoria do fluxo:
  1. `worklyhub-flow-orchestrator`
  2. `worklyhub-architect`
  3. `worklyhub-senior-dev-analyst`
  4. `worklyhub-flow-orchestrator` (fechamento)
- Consulte o index para descobrir quais arquivos de instrucoes aplicar em cada etapa.

Agents principais

- `worklyhub-flow-orchestrator`: triagem, delegacao e consolidacao final.
- `worklyhub-architect`: define arquitetura, padroes e plano tecnico.
- `worklyhub-senior-dev-analyst`: executa a implementacao definida pelo arquiteto.

Agents de apoio (quando necessario)

- `worklyhub-domain`: refinamento de regras de negocio.
- `worklyhub-product-market-specialist`: descoberta e priorizacao de novas features (genericas ou por modulo).
- `worklyhub-frontend`: padronizacao visual e experiencia UI.
- `worklyhub-integration`: contratos HTTP, erros e integracoes API.

MCP

- Configuracao base em `mcp.json` (filesystem, git, fetch, github opcional).
