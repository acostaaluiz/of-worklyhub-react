# GitLab CI/CD

Este repositorio inclui uma esteira GitLab CI pronta para:

- validar padrao de commits (`commitlint`);
- executar qualidade (`lint` e `depcruise`);
- executar testes unitarios (`jest`);
- bloquear merge/release com gates de seguranca (`dependency_scan`, `sast_scan`, `secret_scan`, `container_scan`);
- buildar o frontend (`vite`);
- validar build de imagem Docker em MRs;
- publicar imagem no GitLab Container Registry em `develop`, `master` e `tags`;
- publicar/deploy no GCP Cloud Run com estrategia por ambiente:
  - branch `develop` -> ambiente `development`;
  - branch `master` -> ambiente `production`.

## Arquivos

- `.gitlab-ci.yml`: pipeline principal.
- `Dockerfile`: build multi-stage e runtime Nginx.
- `docker/nginx/default.conf`: configuracao de SPA.
- `.dockerignore`: otimizacao do contexto de build.

## Stages

1. `validate`:
   - `commitlint`
   - `lint`
   - `depcruise`
   - `terraform_validate` (quando ha alteracoes em `infra/**/*`)
2. `test`:
   - `unit_tests`
   - `e2e_smoke` (obrigatorio, sem `allow_failure`)
   - `e2e_manual` (manual e `allow_failure`)
3. `security`:
   - `dependency_scan` (audit de dependencias com severidade `high+`)
   - `sast_scan` (Semgrep)
   - `secret_scan` (Gitleaks)
   - `container_image_build_for_scan` (gera imagem `.tar` para analise)
4. `build`:
   - `container_scan` (Trivy na imagem `.tar`, severidade `HIGH,CRITICAL`)
   - `build_app`
5. `package`:
   - `docker_build_verify` (MR, sem push)
   - `docker_publish` (develop/master/tags, com push no registry)
6. `deploy`:
   - `gcp_deploy_develop` (branch `develop`)
   - `gcp_deploy_master` (branch `master`)

## Variaveis de CI recomendadas

As variaveis abaixo sao opcionais, mas recomendadas para builds de ambiente:

- `VITE_API_BASE_URL`
- `VITE_CURRENCY_LOCALE`
- `VITE_CURRENCY_CODE`
- `VITE_CURRENCY_PRECISION`
- `SECURITY_SEVERITY_THRESHOLD` (default: `HIGH,CRITICAL`)

## Variaveis de CI obrigatorias para deploy GCP

### Desenvolvimento (`develop`)

- `GCP_PROJECT_ID_DEVELOP`
- `GCP_REGION_DEVELOP`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY_DEVELOP`
- `GCP_CLOUD_RUN_SERVICE_DEVELOP`
- `GCP_SERVICE_ACCOUNT_KEY_DEVELOP` (JSON key ou file variable)
- `VITE_API_BASE_URL_DEVELOP`
- `VITE_CURRENCY_LOCALE_DEVELOP` (opcional, default `en-US`)
- `VITE_CURRENCY_CODE_DEVELOP` (opcional, default `USD`)
- `VITE_CURRENCY_PRECISION_DEVELOP` (opcional, default `2`)

### Producao (`master`)

- `GCP_PROJECT_ID_MASTER`
- `GCP_REGION_MASTER`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY_MASTER`
- `GCP_CLOUD_RUN_SERVICE_MASTER`
- `GCP_SERVICE_ACCOUNT_KEY_MASTER` (JSON key ou file variable)
- `VITE_API_BASE_URL_MASTER`
- `VITE_CURRENCY_LOCALE_MASTER` (opcional, default `en-US`)
- `VITE_CURRENCY_CODE_MASTER` (opcional, default `USD`)
- `VITE_CURRENCY_PRECISION_MASTER` (opcional, default `2`)

Variaveis nativas do GitLab utilizadas para publicar imagem:

- `CI_REGISTRY`
- `CI_REGISTRY_IMAGE`
- `CI_REGISTRY_USER`
- `CI_REGISTRY_PASSWORD`

## Tags de imagem publicadas

A job `docker_publish` publica:

- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}`
- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}` (branch)
- `${CI_REGISTRY_IMAGE}:latest` (somente branch `master`)
- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}` (tags Git)

## Deploy GCP

Jobs de deploy usam:

- `gcloud builds submit` com `infra/cloudbuild/cloudbuild.frontend.yaml`
- push para `${GCP_REGION}-docker.pkg.dev/...`
- `gcloud run deploy` no servico configurado por ambiente

Terraform da infraestrutura: `infra/README.md`.

## Execucao local do Docker

```bash
docker build -t worklyhub-frontend:local .
docker run --rm -p 8080:8080 worklyhub-frontend:local
```

Aplicacao disponivel em `http://localhost:8080`.
