# Cypress E2E

## Scope inicial

- Cadastro (`/register`)
- Login (`/login`)
- Company setup (`/company/introduction`)
- Sessao persistida com plano ativo:
  - usuario ja autenticado deve abrir em `/home` (nao `/billing/plans`)
- Sessao persistida expirada:
  - token expirado deve limpar `auth.idToken`/`auth.session` e redirecionar para `/login`
- Sessao persistida com plano ativo e sem workspace:
  - usuario autenticado deve seguir para `/company/introduction`
- Gate de plano inativo:
  - usuario autenticado sem plano ativo e redirecionado para `/billing/plans`
  - rotas de billing continuam acessiveis nesse estado
- Gate de modulo (plano ativo):
  - rota de modulo nao habilitado no overview redireciona para `/modules`
- Logout:
  - acao de sair no menu do usuario redireciona para `/login` e limpa cache local
- Assistant Chat AI:
  - abre widget, envia mensagem, valida chamada API e resposta com sugestoes
- Seguranca de cabecalhos:
  - valida baseline de CSP no documento (`meta[http-equiv=\"Content-Security-Policy\"]`)
- Login + cadastros basicos:
  - Servicos (`/company/services`)
  - Categorias de inventario (`/inventory/categories`)
  - Produtos de inventario (`/inventory/home`)
  - Colaboradores (`/people`)
  - Status de work order (`/work-order/statuses`)

## Estrategia de execucao

- O spec inicial usa mocks de rede para manter o fluxo deterministico:
  - `internal/auth/register`
  - Firebase Auth (`accounts:signInWithPassword` e `accounts:lookup`)
  - `internal/auth/verify-token`
  - endpoints de `users`, `application`, `company` e `me/overview` usados no onboarding
- Objetivo: validar jornada UI completa sem dependencia de backend/Firebase em ambiente local.

## Scripts

- `pnpm dev:e2e` (frontend para testes E2E em `4173`)
- `pnpm dev` (frontend para testes reais em `5173`)
- `pnpm cypress:open`
- `pnpm cypress:run`
- `pnpm cypress:run:smoke` (spec unico de smoke para CI obrigatorio)
- `pnpm cypress:run:security` (cenarios de sessao expirada + baseline CSP)
- `pnpm test:e2e` (sobe `vite --port 4173 --strictPort` e executa o Cypress)
- `pnpm test:e2e:smoke` (sobe o app e executa apenas o smoke de redirect para `/home`)
- `pnpm test:e2e:security` (sobe o app e executa os cenarios E2E de seguranca)
- `pnpm test:e2e:onboarding-all-plans` (registro -> company setup -> planos -> checkout -> home para starter/standard/premium com mocks)
- `pnpm test:e2e:premium-real`
- `pnpm test:e2e:starter-real`
- `pnpm test:e2e:standard-real`
- `pnpm test:e2e:employee-workspace-real`
- `pnpm test:e2e:plans-real`

## Variaveis de ambiente

- `CYPRESS_BASE_URL` (default: `http://localhost:4173`)
- `CYPRESS_API_BASE_URL` (default: `http://localhost:3000/api/v1`)
- `CYPRESS_E2E_PASSWORD` (default: `WorklyHub123!`)
- `CYPRESS_RUN_REAL_ENTITLEMENT` (default: `false`) habilita specs reais sem mocks de entitlement por plano.
- `CYPRESS_PREMIUM_EMAIL` usuario premium real para o spec de entitlement.
- `CYPRESS_PREMIUM_PASSWORD` senha do usuario premium real para o spec de entitlement.
- `CYPRESS_STARTER_EMAIL` usuario starter real para o spec de entitlement.
- `CYPRESS_STARTER_PASSWORD` senha do usuario starter real para o spec de entitlement.
- `CYPRESS_STANDARD_EMAIL` usuario standard real para o spec de entitlement.
- `CYPRESS_STANDARD_PASSWORD` senha do usuario standard real para o spec de entitlement.

## Entitlement real por plano (backend + DB)

Specs:

- `cypress/e2e/modules/premium-entitlement-real.cy.ts`
- `cypress/e2e/modules/starter-entitlement-real.cy.ts`
- `cypress/e2e/modules/standard-entitlement-real.cy.ts`
- `cypress/e2e/modules/employee-workspace-access-real.cy.ts`
- `cypress/e2e/auth/persisted-session-active-plan-redirect-home.cy.ts` (mockado)
- `cypress/e2e/auth/inactive-plan-route-gate.cy.ts` (mockado)
- `cypress/e2e/auth/persisted-session-active-plan-no-workspace-redirect-company.cy.ts` (mockado)
- `cypress/e2e/auth/logout-clears-session.cy.ts` (mockado)
- `cypress/e2e/modules/module-access-guard-redirect.cy.ts` (mockado)
- `cypress/e2e/users/assistant-chat-widget.cy.ts` (mockado)

Os testes validam:

- login real
- contrato real de `GET /me/overview` via `CYPRESS_API_BASE_URL`
- presenca/ausencia de cards em `/modules` conforme plano
- bloqueio de `/growth` e `/company/slas` para Starter e Standard
- acesso liberado a `/growth` para Premium
- fluxo real de colaborador do workspace:
  - dono premium cria colaborador ativo (perfil `it-infra`) e convite pendente (sem `user_uid`)
  - colaborador ativo faz login e recebe modulos filtrados por hierarquia + plano do workspace
  - bloqueio de `/dashboard` e `/growth` para perfil `it-infra`

Execucao exemplo (PowerShell):

```powershell
$env:CYPRESS_RUN_REAL_ENTITLEMENT="true"
$env:CYPRESS_BASE_URL="http://localhost:5173"
$env:CYPRESS_API_BASE_URL="http://localhost:3000/api/v1"
$env:CYPRESS_PREMIUM_EMAIL="mariarita@gmail.com"
$env:CYPRESS_PREMIUM_PASSWORD="<senha>"
$env:CYPRESS_STARTER_EMAIL="rita.starter@worklyhub.dev"
$env:CYPRESS_STARTER_PASSWORD="<senha>"
$env:CYPRESS_STANDARD_EMAIL="rita.standard@worklyhub.dev"
$env:CYPRESS_STANDARD_PASSWORD="<senha>"
pnpm cypress:run --spec "cypress/e2e/modules/*-entitlement-real.cy.ts"
```

## Convencoes

- Seletores estaveis via `data-cy`
- Testes independentes (`testIsolation: true`)
- Usuario unico por execucao (`timestamp`) para evitar conflito de cadastro
