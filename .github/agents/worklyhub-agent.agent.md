# Instruções do Copilot / Agent para este repositório

## Objetivo

Este documento fornece instruções detalhadas para agentes (humanos ou modelos de IA) que vão desenvolver novos módulos, corrigir bugs ou estender a aplicação. Deve ser usado como prompt/guia padrão: descreve arquitetura, convenções, padrões e passos práticos para scaffolding e integração com o `core` e `shared` do projeto.

## Escopo

- Frontend em React + TypeScript com `vite`.
- Estrutura do código em `src/` com ênfase em `@core`, `@shared` e `@modules`.
- Convenções de import (aliases), tipagem `strict` e fluxo de tratamento de erros via `core`.

## Visão rápida da stack e versões

- React: ^19.2.0
- React Router: ^7.10.1
- TypeScript: ~5.9.3
- Vite: (override) rolldown-vite@7.2.5
- UI: `antd` ^6.x, `bootstrap` ^5.x, `styled-components` ^6.x
- HTTP/requests: `axios` ^1.13.x, abstraído por `@core/http`
- RxJS: ^7.8.x
- Charts / Calendar: `recharts`, `@toast-ui/calendar`
- Lint/format: `eslint`, `prettier`, `husky`, `lint-staged`, `commitlint`, `commitizen`

## Aliases e paths

Use sempre os aliases definidos no projeto:

- `@app/*` → `src/app/*`
- `@core/*` → `src/core/*`
- `@shared/*` → `src/shared/*`
- `@modules/*` → `src/modules/*`

Não utilizar caminhos relativos longos (`../../..`) entre módulos.

## Princípios arquiteturais

- Modularização por domínio (`src/modules/<feature>`).
- `core` contém infra e cross-cutting concerns (http, auth, logger, storage, errors, config/theme).
- `shared` contém primitives reutilizáveis (base components, templates, providers, hooks, ui, styles).
- `app` orquestra bootstrapping: router, providers e theme.
- Separação clara entre presentation (UI), services (API) e interfaces (contratos).

## Regras e convenções de desenvolvimento

- Tipagem: `tsconfig.app.json` exige `strict: true` — todo código novo deve ter tipos explícitos.
- Imports: use aliases; mantenha imports ordenados e agrupados por origem (externo, @core, @shared, @modules, relativo).
- HTTP: usar `@core/http/http-client` para todas as requisições. Nunca usar `axios` diretamente em components.
- HTTP: usar `@core/http/http-client` para todas as requisições. Nunca usar `axios` diretamente em components.
- Service API wrapper: Para cada domínio que faz chamadas HTTP diretas, crie um wrapper de API em `src/modules/<feature>/services/<feature>-api.ts` que estenda `BaseHttpService` e exponha métodos tipados (`createWorker`, `updateWorker`, `listSomething`, etc.). Os services (ex.: `people.service.ts`) devem instanciar esse API wrapper com `new XApi(httpClient)` e usar seus métodos em vez de chamar `httpClient` diretamente. Isso mantém coerência com padrões existentes (`CompaniesApi`) e facilita mapeamento/transformação de resposta e tratamento de erros.
- Erros: transformar erros com `to-app-error.ts` e identificar com `is-app-error.ts` antes de exibir na UI.
- Logging: use `@core/logger` para eventos, warnings e erros críticos.
- Estilo: usar `styled-components` ou os componentes `shared/ui` quando possível. Use `global.scss` somente para tokens/variáveis globais.
- Estado: prefira local state e hooks; se usar stores globais siga os patterns já presentes (ver `src/app/store` se houver infra).
- Testes: adicionar testes unitários quando lógica não trivial for implementada.

## Padrões observados (por arquivo)

- `core/http/*`: abstração HTTP centralizada + mapeamento de erros.
- `core/errors/*`: modelos `AppError` e utilitários para conversão.
- `shared/base/*`: `base.component.ts`, `base.page.ts`, `base.template.tsx` — reusar para consistência de layout e comportamento.
- `presentation/*`: separar `pages`, `components`, `templates`, `stacks`.

## Padrão obrigatório para Components, Templates e Pages

Este projeto segue um padrão com classes/base para garantir consistência de layout, estados (loading/erro) e organização de responsabilidades.
Ao criar UI nova, respeitar as seguintes regras:

1. Component (presentation/components)

- Objetivo: componentes de UI e interação (lista, card, formulário, seção). Podem buscar dados (quando fizer sentido), mas devem seguir o ciclo do `BaseComponent`.
- Base obrigatória:
  - Componentes de classe devem estender `@shared/base/base.component` (ex.: `export class X extends BaseComponent<..., ...>`).
- Estados e renderização:
  - A UI principal deve ser implementada em `protected override renderView(): React.ReactNode`.
  - Estados de carregamento e erro devem ser tratados via:
    - `protected override renderLoading(): React.ReactNode`
    - `protected override renderError(error: unknown): React.ReactNode`
- Data fetching:
  - Quando houver chamadas async no componente, usar `this.runAsync(...)` e `this.setSafeState(...)` (nunca setState inseguro).
  - Buscar dados em `componentDidMount`, chamando `super.componentDidMount?.()` quando existir.
- Organização de estado:
  - Manter `state` tipado (TypeScript strict) e evitar `any`.
  - `error?: unknown` deve ser permitido quando o fluxo do componente prevê captura de erro.
- Estilos:
  - Estilos do componente devem ficar em arquivo dedicado `*.styles.ts` via `styled-components`.
  - Não usar caminhos relativos longos; usar aliases (`@modules`, `@shared`, `@core`).

Local:

- `src/modules/<feature>/presentation/components/<nome>/<nome>.component.tsx`
- `src/modules/<feature>/presentation/components/<nome>/<nome>.component.styles.ts`

2. Template (presentation/templates)

- Objetivo: compor layout e orquestrar blocos/padrões de tela (frames, shells, composição de sections) sem concentrar regras de roteamento.
- Base obrigatória:
  - Templates devem ser implementados como function component e compor `@shared/base/base.template`.
  - O conteúdo deve ser passado no `content={...}` do `BaseTemplate`.
- Layout:
  - Quando aplicável, usar `PrivateFrameLayout` (ou frame equivalente já existente) dentro do `BaseTemplate`.
  - O template deve receber dados via `props` (ex.: `service: ServiceModel`) e callbacks (ex.: `onBooked`).
- Side-effects e integrações:
  - Se precisar buscar dados auxiliares (ex.: categorias), pode usar `useEffect` + state local.
  - Fluxos de confirmação (ex.: modal) devem ficar no template: abrir/fechar modal, callbacks e feedback (message/notification).
- Estilos:
  - Estilos do template devem ficar em arquivo dedicado `*.styles.ts` via `styled-components`.

Local:

- `src/modules/<feature>/presentation/templates/<nome>/<nome>.template.tsx`
- `src/modules/<feature>/presentation/templates/<nome>/<nome>.template.styles.ts`

3. Page (presentation/pages)

- Objetivo: representar uma rota. A Page carrega dados necessários para a rota e renderiza o Template correto.
- Base obrigatória:
  - Pages de classe devem estender `@shared/base/base.page` (ex.: `export class XPage extends BasePage`).
- Metadados e autenticação:
  - Configurar `protected override options = { title: string, requiresAuth: boolean }`.
- Renderização:
  - A UI da rota deve ser implementada em `protected override renderPage(): React.ReactNode`.
  - Evitar renderizar UI complexa diretamente na Page; preferir delegar ao Template.
- Data fetching:
  - Buscar dados no `componentDidMount`, chamando `super.componentDidMount?.()` quando existir.
  - A Page deve resolver params de rota e selecionar/obter o recurso necessário para repassar ao Template.
- Params (React Router):
  - Para usar `useParams()` em pages baseadas em classe, criar um `Wrapper()` function component que lê params e passa via props.

Local:

- `src/modules/<feature>/presentation/pages/<nome>/<nome>.page.tsx`

## Resumo de responsabilidades

- Component: UI e interação local (pode buscar dados via BaseComponent, seguindo runAsync/setSafeState).
- Template: composição de layout e orquestração de componentes (BaseTemplate + Frame/Layouts).
- Page: rota (BasePage), leitura de params, carregamento de dados e renderização do Template.

## Como criar um novo módulo (checklist mínimo)

1. Criar pasta: `src/modules/<feature>/`
2. Adicionar `interfaces/<feature>.model.ts` com os tipos públicos do módulo.
3. Adicionar `services/<feature>.service.ts` que usa `@core/http/http-client`.
4. Adicionar `presentation/pages/<Feature>Page.tsx` e `presentation/components` conforme necessidade.
5. Se houver rotas, criar `presentation/stacks` com `private`/`public` stack conforme critério de autenticação.
6. Registrar rota na `app/router/routes.tsx` (ou adicionar stack em `private.stack.ts`/`public.stack.ts`).
7. Escrever testes unitários e/ou mocks para o service.
8. Rodar lint/format e seguir commitizen para a mensagem de commit.

## Exemplo de scaffold (arquivos sugeridos)

- `src/modules/<feature>/interfaces/<feature>.model.ts`
- `src/modules/<feature>/services/<feature>.service.ts`
- `src/modules/<feature>/presentation/pages/<Feature>Page.tsx`
- `src/modules/<feature>/presentation/components/<FeatureList>.tsx`
- `src/modules/<feature>/presentation/templates/<FeatureTemplate>.tsx`

## Regras de código e snippets (recomendações essenciais)

- Service (padrão):
  - Usar injeção/instância do `HttpClient` do `@core`.
  - Mapear respostas para modelos locais.

- Tratamento de erro (exemplo):
  - try { await client.get(); } catch(e) { const appErr = toAppError(e); throw appErr; }

- Componentes/Pages:
  - Preferir compor `shared/base/base.template` e `shared/ui` components.
  - Não acoplar lógica de requests diretamente na render; use hooks ou services.

## Padrões para rotas e autenticação

- Separe rotas públicas e privadas em `app/router/stacks`.
- Checar sessão via `@core/auth` antes de renderizar rota privada.

## CI/CD, lint e commits

- `npm run build` executa `tsc -b` e em seguida `vite build`.
- Pré-commit: `husky` + `lint-staged` (eslint/ prettier).
- Commit: usar `commitizen` (cz-git) e validar com `commitlint`.

## Como instruir um modelo de IA (prompt template)

Ao pedir para gerar código novo, inclua:

1. Nome do módulo e objetivo conciso.
2. Endpoints disponíveis (verbos, paths, payloads e respostas esperadas).
3. Se a rota é `public` ou `private`.
4. Componentes `shared` que devem ser usados.
5. Exigir: paths exatos dos arquivos a criar, stubs de interface, service, page, componente e atualização de rotas.
6. Exigir código compatível com `strict: true` e uso de aliases (`@core`, `@shared`, `@modules`).

## Exemplo breve de prompt para IA

"Crie um módulo `invoices` que lista faturas. Endpoints: `GET /invoices` retorna `Invoice[]`. Módulo privado. Gere: `interfaces/invoice.model.ts`, `services/invoice.service.ts` (usa `@core/http/http-client`), `presentation/pages/InvoicesPage.tsx` (usa `shared/base`), componentes necessários e adicione rota privada no `private.stack.ts`. Forneça testes unitários básicos e mensagem de commit (cz-git)."

## Notas finais e boas práticas

- Sempre converta erros do backend para `AppError` via `to-app-error`.
- Reutilize `shared` antes de criar novos componentes.
- Mantenha pequenos commits atômicos e mensagens semânticas.
- Antes de abrir PR: rodar `npm run lint`, `npm run build` e testes.

## Contato e dúvidas

Se a convenção não estiver clara, abra uma issue descrevendo a proposta de alteração para revisão de arquitetura.

---

Gerado para uso como prompt e guia de implementação para modelos IA e desenvolvedores humanos.

## Detalhamento técnico adicional (theme, tokens, http-base, Ant Design)

Este projeto contém infra de theming e tokens e uma camada HTTP base que devem ser seguidas rigorosamente. Abaixo estão especificações e exemplos práticos para evitar erros ao desenvolver novos módulos.

1. Theme, tokens e providers

- Localização principal:
  - Theme service: `src/core/config/theme/theme.service.ts`
  - Theme provider (bootstrap): `src/app/bootstrap/theme-provider.component.tsx`
  - Global styles/tokens: `src/shared/styles/global.scss` e `src/shared/styles/global.ts`
- Conceito:
  - `theme.service` expõe tokens, paletas e utilitários para alternar temas (light/dark/custom).
  - `theme-provider.component.tsx` envolve a aplicação com providers (`styled-components` ThemeProvider, `antd` ConfigProvider se usado) e injeta tokens na árvore React.
  - Tokens devem ser a fonte da verdade: cores, espaçamentos, tipografia e breakpoints. Use `global.scss` apenas para variáveis SASS que sejam tokens transversais; prefira `global.ts` para tokens exportáveis em TS.
- Boas práticas:
  - Nomeie tokens em camelCase e com prefixo semântico (ex.: `colorPrimary`, `spacingSmall`, `fontSizeBase`).
  - Exporte tipos TS para tokens (ex.: `ThemeTokens`), garantindo autocomplete e `strict` safety.
  - Evite hardcodes; sempre consumir tokens do `theme` ou `shared/styles`.

2. Integração com Ant Design (v6)

- Strategy:
  - Use `antd` `ConfigProvider` no `theme-provider.component` para injetar tokens do antd (token overrides) junto com `styled-components` ThemeProvider.
  - Mapear tokens do `theme.service` para `antd` tokens (ex.: `token.colorPrimary = theme.tokens.colorPrimary`).
- Customização:
  - Evite sobrescrever estilos do Ant globalmente; prefira `ConfigProvider` e `styled-components` wrappers para adaptar componentes quando necessário.
  - Para variantes específicas, crie wrappers em `src/shared/ui/components/antd` que recebem `ThemeTokens` e aplicam estilos via `styled-components`.

3. Tokens e composição de estilos

- Arquitetura:
  - `global.ts` exporta um objeto `defaultTheme` e tipos `ThemeTokens`.
  - `global.scss` contém apenas variáveis SASS que precisam ser consumidas por bibliotecas que exigem CSS (ex.: libs externas). Preferir JS/TS tokens.
- Uso nos componentes:
  - Em componentes React, consumir via `useTheme()` (hook provendo `ThemeTokens`) ou `styled` interpolations (`styled.div(({ theme }) => theme.tokens.colorPrimary)`).

4. HTTP base e contratos (evitar erros comuns)

- Localização:
  - `src/core/http/base-http.service.ts` — contém lógica comum (headers, interceptors, token injection, retry policies mínimas).
  - `src/core/http/http-client.ts` — wrapper/abstração usada por services dos módulos.
  - `src/core/http/http-error-mapper.ts` — mapeia erros de transporte para `AppError`.
- Regras obrigatórias:
  - NUNCA instanciar `axios` diretamente em `presentation` ou components. Use `@core/http/http-client`.
  - Todos os serviços devem capturar erros e re-lançar convertidos com `to-app-error.ts`.
  - Autenticação: `base-http.service` deve ler token via `@core/storage` ou `@core/auth` e injetar no header `Authorization`.
- Padrão de service (exemplo):

```ts
// src/modules/feature/services/feature.service.ts
import { httpClient } from "@core/http/http-client";
import { toAppError } from "@core/errors/to-app-error";
import type { Feature } from "../interfaces/feature.model";

export const FeatureService = {
  async list(): Promise<Feature[]> {
    try {
      const res = await httpClient.get<Feature[]>("/features");
      return res.data;
    } catch (err) {
      throw toAppError(err);
    }
  },
};
```

5. Error handling detalhado

- Fluxo esperado:
  - `base-http.service` captura respostas HTTP com status >= 400 e normaliza formato.
  - `http-error-mapper` converte códigos e payloads para `AppError` com códigos de negócio (`code`, `message`, `details`).
  - Em `presentation`, use `isAppError` para branch de UI e exibir mensagens amigáveis.

6. Logger, storage e auth

- Logger: use `@core/logger/console.logger.ts` ou implemente `Logger` que segue `@core/logger/interfaces/logger.interface.ts`.
- Storage: centralize leitura/gravação em `@core/storage` para facilitar mocks e testes.
- Auth: `@core/auth` deve expor hooks/guards (ex.: `useAuth`, `RequireAuth`) usados por `private.stack.ts`.

7. Examples e anti-patterns a evitar

- Anti-patterns:
  - Importar `@core/http` diretamente em components.
  - Misturar tokens CSS hardcoded em componentes; sempre usar `theme`.
  - Modificar `shared` sem revisão arquitetural — prefira estender.
- Exemplos recomendados:
  - Criar `src/modules/invoices` com services, interfaces, pages e adicionar rota privada em `app/router/stacks/private.stack.ts`.

8. Checklist final (detalhado) ao criar um módulo

- 1. Criar `src/modules/<feature>/interfaces/<feature>.model.ts` com tipos e validações básicas.
- 2. Criar `src/modules/<feature>/services/<feature>.service.ts` usando `httpClient` e `toAppError`.
- 3. Criar `presentation/components` reutilizando `shared/ui` e `shared/base`.
- 4. Criar `presentation/templates` se o layout for repetido em múltiplas pages.
- 5. Registrar rotas em `app/router/routes.tsx` ou adicionar `presentation/stacks/<feature>.stack.tsx` e importar em `private.stack.ts`.
- 6. Garantir estilos via `styled-components` e consumo de `ThemeTokens`.
- 7. Adicionar testes unitários para services e hooks; adicionar storybook stories se existir infra.
- 8. Rodar `npm run lint` e `npm run build`.
- 9. Commit via `npm run commit` (commitizen) com mensagem semântica.

---

## Padrões obrigatórios de UX (estados)

Toda page ou fluxo deve considerar explicitamente:

- Loading inicial
- Estado vazio (empty state)
- Erro recuperável (ex.: falha de request)
- Erro não recuperável
- Feedback de sucesso

Sempre reutilizar componentes de estado do `shared` quando disponíveis.

---

## Definition of Done (DoD) para features/módulos

Uma feature/módulo só é considerada concluída quando:

- Tipagem está `strict` e sem `any`
- Serviços possuem tratamento de erro via `toAppError`
- UI usa tokens e componentes `shared`
- Rotas estão registradas corretamente
- Casos de erro são tratados na UI
- Testes cobrem a lógica não trivial
- Build (`npm run build`) passa sem warnings

---

Referências internas: consulte os arquivos abaixo para templates e samples:

- `src/core/http/base-http.service.ts`
- `src/core/http/http-client.ts`
- `src/core/http/http-error-mapper.ts`
- `src/core/errors/to-app-error.ts`
- `src/core/config/theme/theme.service.ts`
- `src/app/bootstrap/theme-provider.component.tsx`
- `src/shared/styles/global.scss`
- `src/shared/styles/global.ts`

# WorklyHub — Contexto de Produto em que o Agente vai trabalhar.

## O que é

WorklyHub é uma plataforma SaaS para empresas de serviços e um marketplace para clientes finais.
O foco do produto é: permitir que clientes encontrem empresas, comparem serviços e realizem agendamentos;
e permitir que empresas gerenciem operação (agenda, clientes, equipe, cobrança e rotinas administrativas).

## Personas (atores)

1. Cliente final (consumer):
   - Objetivo: encontrar uma empresa confiável, entender serviços/preços e agendar rapidamente.
   - Necessidades: confiança, disponibilidade, confirmação, remarcação, histórico e avaliações.

2. Empresa (merchant):
   - Objetivo: receber agendamentos, organizar agenda/equipe e transformar atendimento em receita recorrente.
   - Necessidades: catálogo de serviços, agenda, gestão de clientes, cobrança, relatórios, automações.

3. Colaborador (staff) (quando aplicável):
   - Objetivo: executar atendimentos e manter agenda atualizada.
   - Necessidades: visão diária, confirmação, check-in, status do atendimento.

## Jornadas principais

Cliente:

- Descobrir empresa (Home/Busca) -> Comparar -> Ver perfil da empresa -> Selecionar serviço -> Escolher data/hora -> Confirmar
- Pós-agendamento: visualizar próximos agendamentos, remarcar/cancelar, avaliar empresa, favoritar

Empresa:

- Onboarding (Company setup) -> Configurar serviços e horários -> Receber agendamentos -> Atender -> Cobrar -> Retenção
- Operação: controle de agenda, bloqueios, capacidade, equipe, comunicação com cliente

## Domínios e módulos existentes (estado atual)

- schedule: agenda e criação/visualização de eventos
- clients: gestão de clientes (empresa)
- company: cadastro/configuração da empresa (merchant)
- people: equipe/usuários internos (merchant/staff)
- billing: planos/assinatura do WorklyHub (SaaS)
- finance: receitas/despesas/controle financeiro (merchant)
- inventory: estoque/insumos (merchant)
- dashboard: KPIs e visão executiva (merchant)

## O que o agent deve otimizar ao sugerir novos módulos

- Conversão do cliente final (busca -> agendamento)
- Confiança (perfil completo, avaliações, políticas)
- Retenção (histórico, favoritos, rebooking, lembretes)
- Eficiência operacional da empresa (no-show, capacidade, confirmação, automações)
- Integração consistente com os domínios existentes (schedule/clients/billing)

## Política para sugerir novos módulos

Quando sugerir um novo módulo/feature, o agent deve sempre entregar:

1. Problema/Jornada que resolve (cliente ou empresa)
2. Páginas mínimas (MVP) e navegação
3. Modelos/entidades e relações com módulos existentes
4. Integrações (schedule/clients/finance/billing)... entre outros.
5. Critérios de sucesso (métricas/eventos)

## Non-goals (por enquanto)

- Evitar features que exijam logística complexa (entregas), redes sociais internas ou chat em tempo real
  sem uma necessidade clara para o MVP do produto.

## Aprendizado contínuo do agent (governança)

Este arquivo é um artefato vivo e pode evoluir conforme o produto WorklyHub amadurece.

O agent está autorizado a:

- Identificar padrões recorrentes de implementação
- Detectar novos domínios, módulos ou fluxos consolidados
- Sugerir melhorias na arquitetura, convenções ou contexto de produto

Restrições obrigatórias:

- O agent NUNCA deve modificar este arquivo automaticamente.
- Toda alteração deve ser PROPOSTA antes de ser aplicada.
- A proposta deve conter:
  1. Justificativa clara (o que foi aprendido e por quê)
  2. Categoria do aprendizado (produto, arquitetura, domínio, processo)
  3. Diff explícito (trechos a adicionar/remover/alterar)
  4. Impacto esperado no desenvolvimento futuro

Formato de proposta:

- A proposta deve ser apresentada em Markdown
- O diff deve ser mostrado com blocos ```diff
- Nenhuma alteração é aplicada sem confirmação explícita do usuário

Confirmação:

- Somente após resposta explícita contendo "APROVAR ATUALIZAÇÃO DO AGENT"
  o agent poderá gerar a versão final atualizada do arquivo.

Versionamento:

- Toda atualização aprovada deve adicionar uma entrada em:
  "Histórico de evolução do agent"

## Histórico de evolução do agent

### v1.0.0 — Setup inicial

- Arquitetura base React + Core + Shared + Modules
- Regras de desenvolvimento, HTTP, erros e theming
- Contexto inicial do produto WorklyHub

(Entradas futuras devem ser adicionadas aqui pelo agent após aprovação)

## Sistema de aprendizagem do agent

Este agent deve atuar como um agente de aprendizagem supervisionada do produto WorklyHub.

Durante o desenvolvimento, o agent deve observar:

- Novos módulos recorrentes
- Decisões arquiteturais repetidas
- Novos fluxos de negócio consolidados
- Mudanças claras no escopo ou posicionamento do produto
- Convenções que surgem na prática e não estavam documentadas

Quando identificar um aprendizado relevante, o agent deve:

1. Informar explicitamente que um aprendizado foi identificado
2. Classificar o aprendizado em uma das categorias:
   - Produto
   - Domínio de negócio
   - Arquitetura
   - UX/UI
   - Processo de desenvolvimento
3. Propor uma atualização no arquivo:
   `.github/agents/worklyhub-agent.agent.md`
4. Apresentar a proposta com:
   - Justificativa
   - Texto sugerido
   - Diff em formato Markdown
5. Aguardar confirmação explícita antes de qualquer alteração

O agent NÃO está autorizado a:

- Alterar este arquivo automaticamente
- Omitir diffs
- Substituir regras existentes sem justificar impacto
- Atualizar múltiplas seções sem granularidade

Objetivo do aprendizado:

- Tornar o agent progressivamente mais alinhado ao produto real
- Reduzir retrabalho e decisões implícitas
- Preservar coerência arquitetural e de negócio

Fim das instruções estendidas.

## Complemento — Padrões e Boas Práticas (adendo)

Este adendo complementa o documento existente com regras práticas e incisivas para desenvolvimento no WorklyHub.
As recomendações abaixo devem ser seguidas estritamente por novos códigos e por PRs que alterem infra-estrutura ou padrões.

### Resumo executivo do negócio

- WorklyHub é uma plataforma SaaS para empresas de serviços (merchants) e clientes finais (consumers).
- Objetivo técnico: permitir operações de catálogo, agenda, colaboradores, clientes e faturamento com alta consistência arquitetural, testabilidade e segurança.
- Prioridade: consistência entre domínios (`@modules`), baixo acoplamento entre `presentation` e `core`, e responsabilidade clara entre `API wrapper` (HTTP), `service` (domínio) e `page/component` (UI).

### Padrões obrigatórios: Components

- Tipo: componentes de interface com lógica local devem ser classes que estendem `@shared/base/base.component`.
- Render: implementar `protected override renderView()`; não coloque lógica de render fora deste método.
- Side-effects / fetch: use `this.runAsync(...)` para chamadas assíncronas e `this.setSafeState(...)` para atualizar `state`.
- State: declarar tipo de `state` explicitamente; evite `any`. Permita `error?: unknown` quando necessário.
- Estilos: colocar styled-components em `*.styles.ts` ao lado do componente.
- Arquivo: `src/modules/<feature>/presentation/components/<name>/<name>.component.tsx`

### Padrões obrigatórios: Templates

- Tipo: templates devem ser Function Components que compõem `@shared/base/base.template`.
- Props: tipar todas as props (incluindo callbacks) e evitar dependências implícitas (contextos globais sem injeção).
- Responsabilidade: layout e orquestração (modais, confirmations, callbacks). Evite lógica de negócio ou chamadas HTTP diretas — prefira receber dados via props.
- Fetch auxiliar: aceitável usar `useEffect` apenas para dados auxiliares (categorias, enums), não para carregar o recurso principal da rota.
- Arquivo: `src/modules/<feature>/presentation/templates/<name>/<name>.template.tsx`

### Padrões obrigatórios: Pages

- Tipo: Pages de rota devem estender `@shared/base/base.page`.
- Metadata: configurar `protected override options = { title, requiresAuth }`.
- Ciclo de carga: buscar dados em `componentDidMount`, sempre chamando `super.componentDidMount?.()` se sobrescrito.
- Params: use wrapper function components para injetar `useParams()` em Pages de classe.
- UX de carregamento: não use o estado de `BasePage` para esconder toda a tela durante saves; use o `loadingService` (overlay global) para operações de persistência de longa duração.
- Arquivo: `src/modules/<feature>/presentation/pages/<Name>.page.tsx`

### Serviços e API wrappers (padrão obrigatório)

- Estrutura:
  - Criar `src/modules/<feature>/services/<feature>-api.ts` que estende `BaseHttpService`.
  - Expor métodos HTTP tipados (ex.: `list(workspaceId: string): Promise<ApiResponse<...>>`).
  - Criar `src/modules/<feature>/services/<feature>.service.ts` que instancia o API wrapper: `const api = new FeatureApi(httpClient)`.
- Responsabilidade do API wrapper: falar apenas com HTTP, formar URLs, headers, timeouts e interceptors.
- Responsabilidade do Service: regras de negócio, mapeamento (API -> Model), caching leve, dedupe de requests (ex.: `_listPromise`), retries limitados e transformar erros com `toAppError`.
- Assinatura de métodos:
  - Use `Promise<T>` explícito.
  - Preferir nomes sem ambiguidade: `create`, `update`, `deactivate`, `list`, `getById`.
  - Para listagens paginadas, usar e retornar estruturas `{ items: T[]; meta: PaginationMeta }`.
- Exemplo (padrão):
  - `class PeopleApi extends BaseHttpService { listWorkspaceWorkers(workspaceId: string) { return this.get(`/...`); } }`
  - `export const PeopleService = { async listEmployees(): Promise<EmployeeModel[]> { try { const r = await api.listWorkspaceWorkers(ws); return mapFromApi(r.data); } catch(e) { throw toAppError(e); } } }`

### Padrão de upload de imagens (recomendação e contrato)

Opções suportadas (preferência por presigned URLs):

1. Fluxo recomendado — Presigned URL (S3-like)

- Backend fornece: `{ uploadUrl: string, method?: 'PUT'|'POST', fields?: Record<string,string> }`
- Frontend: usa `fetch`/`axios` para enviar o arquivo diretamente ao `uploadUrl` (Content-Type apropriado).
- Após PUT/POST, backend deve retornar a `publicUrl` ou a rota deve ser derivada a partir do `uploadUrl`.
- API wrapper: `uploadImagePresigned(file: File, opts: { workspaceId:string }): Promise<string>` → retorna `publicUrl` (string).

2. Fallback — multipart/form-data

- Endpoint: `POST /uploads` aceita `FormData` com:
  - field `file` (File)
  - field `metadata` (JSON string) — opcional: `{ workspace_id, object_type, object_id? }`
- Headers: deixe o browser setar `Content-Type` (boundary).
- API wrapper: `uploadImageMultipart(file: File, metadata: UploadMetadata): Promise<string>`
- Resposta: `{ url: string }`

Notas operacionais:

- Validar tamanho e tipo no cliente e no servidor (ex.: max 5MB, mime `image/*`), rejeitar imagens sem tratamento.
- Sempre retornar URL pública (ou token que permita construção de URL) — evitar que frontend precise decodificar respostas complexas.
- Em services, encapsular upload e persistência (ex.: salvar URL no recurso) em uma única função de alto nível.

### Boas práticas de tipagem e DTOs

- `strict: true` é mandatório; evite `any`.
- Defina tipos simples e reutilizáveis:
  - `type ID = string;`
  - `interface PaginationMeta { page: number; perPage: number; total: number; }`
- Use DTOs para entrada/saída (Ex.: `CreateWorkerDto`, `WorkerResponseDto`) e mappers `toModel(dto)`.
- Validação: quando for necessário validar payloads externos (respostas do backend), use libs como `zod` ou `io-ts` nos boundaries (service/api), nunca no componente.
- Estrutura de nomes: TS usa camelCase; mapeie snake_case do backend em um mapper centralizado.
- Retornos: assinar sempre `Promise<T>`; evite funções que retornam `any` ou `unknown` sem validação.
- Imutabilidade: prefira `Readonly<T>` / `ReadonlyArray<T>` para contratos imutáveis quando aplicável.

### Mapeamento de API / Transformações

- Colocar **mappers** (API -> Model) próximos ao service: `mapWorkerFromApi(apiItem): EmployeeModel`.
- Centralizar conversões de datas, moedas e enums no mapper; nunca espalhar parsing pela UI.

### Tratamento de erros e UX de loading

- Erros: transforme todos os erros com `toAppError(err)` antes de propagar.
- UI: para operações de persistência que afetam a tela atual (create/update/delete), usar `loadingService.show()`/`hide()` para overlay global; use `this.setSafeState({ loading })` para cargas locais (listas, cards).
- Evitar "blank page" durante saves: não depende do `BasePage` loading state para long ops.

### Testes, stories e revisão

- Services: unit tests cobrindo mappers, lógica de dedupe e transformações (mock `httpClient`).
- Components: testes unitários para lógica não trivial; snapshots só se úteis.
- Storybook: documentar componentes reutilizáveis e templates mínimos.

### Commits e PRs

- Mensagens atômicas e com `commitizen` (CZ).
- PR deve incluir:
  - Descrição do problema/objetivo.
  - Impacto nas rotas e contratos de API.
  - Testes adicionados/alterados.
  - Passos para validar localmente (ex.: env vars, seeds).

### Convenções de codificação e comentários

- Evitar comentários no código; prefira nomes claros e funções pequenas. Comentar apenas quando a intenção não puder ser expressa em código.
- Não alterar padrões já estabelecidos sem proposta justificando o ganho (abrir issue).

### Regras do Agent (comportamento)

- O agent sempre responde em português.
- Qualquer proposta de mudança neste arquivo deve apresentar um diff em formato `diff` e aguardar a frase explícita:

  APROVAR ATUALIZAÇÃO DO AGENT

  Somente após essa frase o agent aplicará as alterações no repositório.

## Histórico de evolução do agent
