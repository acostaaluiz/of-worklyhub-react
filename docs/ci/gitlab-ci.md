# GitLab CI/CD

Este documento descreve o pipeline **real** definido em [`.gitlab-ci.yml`](../../.gitlab-ci.yml).

## Visao geral

O pipeline atual possui foco em sincronizacao de repositorio e deploy no GCP:

- `sync`: espelhamento GitLab -> GitHub (opcional).
- `deploy`: build e deploy no Cloud Run.

## Regras de execucao (`workflow`)

O pipeline roda somente quando:

- `CI_PIPELINE_SOURCE == "merge_request_event"`;
- branch `develop`;
- branch `master`.

## Stages e jobs

1. `sync`

- `mirror_to_github`
  - imagem: `alpine/git:2.47.1`
  - executa apenas em `push` para `develop` ou `master`
  - requer `GITHUB_MIRROR_TOKEN`
  - faz `git push` para `acostaaluiz/of-worklyhub-react`

2. `deploy`

- `gcp_deploy_develop`
  - executa em MR com alvo `develop` e em push na branch `develop`
  - ambiente: `development`
  - build via `gcloud builds submit` usando `infra/cloudbuild/cloudbuild.frontend.yaml`
  - deploy via `gcloud run deploy`

- `gcp_deploy_master`
  - executa em MR com alvo `master` e em push na branch `master`
  - ambiente: `production`
  - build via `gcloud builds submit` usando `infra/cloudbuild/cloudbuild.frontend.yaml`
  - deploy via `gcloud run deploy`

## Variaveis obrigatorias para deploy

### Development (`develop`)

- `GCP_PROJECT_ID_DEVELOP`
- `GCP_REGION_DEVELOP`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY_DEVELOP`
- `GCP_CLOUD_RUN_SERVICE_DEVELOP`
- `GCP_SERVICE_ACCOUNT_KEY_DEVELOP`

### Production (`master`)

- `GCP_PROJECT_ID_MASTER`
- `GCP_REGION_MASTER`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY_MASTER`
- `GCP_CLOUD_RUN_SERVICE_MASTER`
- `GCP_SERVICE_ACCOUNT_KEY_MASTER`

## Variaveis de runtime frontend (passadas no build)

- `VITE_API_BASE_URL` (obrigatoria no deploy)
- `VITE_CURRENCY_LOCALE`
- `VITE_CURRENCY_CODE`
- `VITE_CURRENCY_PRECISION`
- `VITE_BILLING_DEV_BYPASS_GATEWAY`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Artefato de deploy

Jobs de deploy publicam `deploy.env` com:

- `SERVICE_URL`
- `IMAGE_URI`
