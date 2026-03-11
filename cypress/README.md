# Cypress E2E

## Scope inicial

- Cadastro (`/register`)
- Login (`/login`)
- Company setup (`/company/introduction`)
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
- `pnpm cypress:open`
- `pnpm cypress:run`
- `pnpm test:e2e` (sobe `vite --port 4173 --strictPort` e executa o Cypress)

## Variaveis de ambiente

- `CYPRESS_BASE_URL` (default: `http://localhost:4173`)
- `CYPRESS_E2E_PASSWORD` (default: `WorklyHub123!`)

## Convencoes

- Seletores estaveis via `data-cy`
- Testes independentes (`testIsolation: true`)
- Usuario unico por execucao (`timestamp`) para evitar conflito de cadastro
