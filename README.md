# WorklyHub Frontend

Aplicacao web para gestao de negocios de servico, organizada por modulos e com arquitetura em camadas. Este repositorio contem o frontend React em TypeScript, com Vite e um conjunto de regras de dependencia validado automaticamente.

## Visao Rapida do Produto

Plataforma SaaS para operacao de negocios de servico, com foco em agenda, clientes, equipe e financeiro. Indicada para pequenas e medias empresas que precisam centralizar atendimento, vendas de servicos e visao operacional em um unico sistema.

## Jornada de Acesso e Monetizacao (obrigatoria)

Fluxo oficial:

1. `registro`
2. `login`
3. `selecao de plano` (`/billing/plans`)
4. `checkout` (`/billing/checkout`)
5. `company setup` (`/company/introduction`)
6. `home` e modulos (`/home`)

Regras de negocio:

- Usuario novo inicia sem plano vinculado.
- Acesso aos modulos privados exige plano ativo.
- Quando o usuario esta com `INACTIVE-PLAN`, o app redireciona para billing.
- O plano so deve ser ativado apos pagamento aprovado (nao na selecao do card).

## Matriz de Acesso por Plano

- `Starter`: `billing`, `clients`, `company`, `dashboard`, `schedule`, `services`.
- `Standard`: tudo do Starter + `finance`, `inventory`, `people`, `work-order`.
- `Premium`: acesso completo aos modulos (inclui `growth` e `sla`).

## Modulos Implementados

- billing
- clients
- company
- dashboard
- finance
- inventory
- people
- schedule
- slas
- users
- work-order

## Stack

- React 19
- TypeScript
- Vite (rolldown-vite)
- React Router
- Ant Design
- styled-components
- RxJS
- Firebase
- Axios

## Integracao com Backend

A comunicacao com o backend ocorre via camada HTTP no `core`, consumindo APIs REST a partir dos servicos de cada modulo. Os endpoints sao centralizados em classes de API por dominio, enquanto os servicos lidam com cache local, normalizacao de dados e regras de orquestracao.

## Arquitetura

Camadas principais em `src`:

- `app`: composicao da aplicacao, rotas, guards e layouts.
- `core`: infraestrutura e servicos base (http, auth, storage, errors, etc).
- `shared`: componentes e utilitarios genericos reutilizaveis.
- `modules`: funcionalidades por dominio.

Resumo teorico:
Arquitetura em camadas com separacao de responsabilidades. A camada `app` compoe a aplicacao e orquestra os modulos. `core` concentra infraestrutura e contratos basicos. `shared` agrega componentes e utilitarios transversais. `modules` implementa as regras de negocio por dominio. O fluxo de dependencias e unidirecional para reduzir acoplamento e evitar ciclos.

Regras de dependencia (validadas pelo dependency-cruiser):

- Sem dependencias circulares.
- `core` nao depende de `shared`, `modules` ou `app`.
- `shared` pode depender de `core`, mas nao de `modules` ou `app`.
- Nenhuma camada deve depender de `app` (app e a camada de composicao).

## Tema da Aplicacao

O tema e baseado em CSS variables definidas em `src/shared/styles/theme/app-theme.scss` e aplicado via atributo `data-theme` no `:root` (`light` ou `dark`). A integracao com Ant Design ocorre no `AppThemeProvider`, que traduz tokens para o tema do Ant.

Preferencia do tema:

- Persistida no `localStorage` com a chave `of-theme-preference`.
- Controlada pelo `themeService` em `src/core/config/theme`.

Exemplo de uso (em runtime):

```ts
import { themeService } from "@core/config/theme/theme.service";

themeService.setPreference("dark"); // "light" | "dark" | "system"
```

## Dependencias e Grafos

Validar dependencias:

```bash
npm run depcruise
```

Gerar grafo HTML:

```bash
npm run depcruise:graph
```

Gerar grafo SVG (requer Graphviz `dot` instalado):

```bash
npm run depcruise:graph:svg
```

## Variaveis de Ambiente

Este projeto usa variaveis `VITE_*`. Crie um arquivo `.env.local` ou ajuste os arquivos existentes `.env.development` e `.env.production`.

Exemplo minimo:

```text
VITE_CURRENCY_LOCALE=en-US
VITE_CURRENCY_CODE=USD
VITE_CURRENCY_PRECISION=2
```

## Configuracao do Backend

- Base URL: definida pela variavel `VITE_API_BASE_URL`.
  - Em desenvolvimento, o `.env.development` aponta para `http://localhost:3000/api/v1`.
  - Em producao, ajuste no `.env.production` ou via variaveis do ambiente.
- CORS: o backend deve permitir a origem do frontend. Em dev, o Vite usa `http://localhost:5173` por padrao.
- Portas: backend tipicamente em `3000` e frontend em `5173` (dev).

## Instalacao

Pre-requisitos:

- Node.js 18+
- npm
- Windows, macOS ou Linux

Instalar dependencias:

```bash
npm install
# ou, em CI:
npm ci
```

## Executar a Aplicacao

Desenvolvimento:

```bash
npm run dev
```

Build de producao:

```bash
npm run build
```

Preview do build:

```bash
npm run preview
```

## Scripts Principais

- `npm run dev` inicia o ambiente de desenvolvimento.
- `npm run build` gera o build de producao.
- `npm run preview` roda o preview do build.
- `npm run lint` executa o ESLint.
- `npm run depcruise` valida as regras de dependencia.
- `npm run depcruise:graph` gera `dependency-graph.html`.
- `npm run depcruise:graph:svg` gera `dependency-graph.svg`.

## CI/CD (GitLab)

Este repositorio possui pipeline GitLab com validacoes de qualidade, testes, build e empacotamento Docker.

- Pipeline: `.gitlab-ci.yml`
- Guia operacional: `docs/ci/gitlab-ci.md`
- Branches de deploy: `develop` (development) e `master` (production)
- Terraform GCP: `infra/README.md`

## Qualidade e Pre-commit

Este repositorio usa:

- ESLint e Prettier.
- Husky e lint-staged.
- Commitizen para padrao de commits.

O lint-staged executa `npm run depcruise` quando arquivos de `src` estao no stage.

## Commits com Commitlint

Este repositorio valida mensagens de commit via `commitlint` no hook `commit-msg`.

Forma recomendada (assistida):

```bash
npm run commit
```

Forma direta:

```bash
git commit -m "feat: resumo da alteracao"
```

Se a mensagem nao seguir o padrao, o commit sera bloqueado.

## Estrutura de Pastas

- `public` arquivos estaticos.
- `src/app` composicao e rotas.
- `src/core` infraestrutura.
- `src/shared` componentes e utilitarios reutilizaveis.
- `src/modules` funcionalidades por dominio.

## Estrutura de Modulos

Breve mapa de responsabilidades por modulo:

- `billing`: planos, checkout e ciclo de cobranca (gate obrigatorio para usuarios sem plano ativo).
- `clients`: cadastro e historico de clientes.
- `company`: dados da empresa e configuracoes de workspace (onboarding apos plano ativo).
- `dashboard`: indicadores operacionais.
- `finance`: entradas, saidas e indicadores financeiros.
- `inventory`: produtos, estoque e itens.
- `people`: colaboradores e equipes.
- `schedule`: agenda, eventos e disponibilidade.
- `slas`: indicadores de SLA e produtividade.
- `users`: perfis, autenticacao, status de plano e preferencias do usuario.
- `work-order`: ordens de servico e status de execucao.
