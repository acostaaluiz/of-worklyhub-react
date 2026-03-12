# GitLab CI/CD

Este repositorio inclui uma esteira GitLab CI pronta para:

- validar padrao de commits (`commitlint`);
- executar qualidade (`lint` e `depcruise`);
- executar testes unitarios (`jest`);
- bloquear merge/release com gates de seguranca (`dependency_scan`, `sast_scan`, `secret_scan`, `container_scan`);
- buildar o frontend (`vite`);
- validar build de imagem Docker em MRs;
- publicar imagem no GitLab Container Registry em `main` e `tags`.

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
2. `test`:
   - `unit_tests`
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
   - `docker_publish` (main/tags, com push no registry)

## Variaveis de CI recomendadas

As variaveis abaixo sao opcionais, mas recomendadas para builds de ambiente:

- `VITE_API_BASE_URL`
- `VITE_CURRENCY_LOCALE`
- `VITE_CURRENCY_CODE`
- `VITE_CURRENCY_PRECISION`
- `SECURITY_SEVERITY_THRESHOLD` (default: `HIGH,CRITICAL`)

Variaveis nativas do GitLab utilizadas para publicar imagem:

- `CI_REGISTRY`
- `CI_REGISTRY_IMAGE`
- `CI_REGISTRY_USER`
- `CI_REGISTRY_PASSWORD`

## Tags de imagem publicadas

A job `docker_publish` publica:

- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_SHA}`
- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_REF_SLUG}` (branch)
- `${CI_REGISTRY_IMAGE}:latest` (somente branch default)
- `${CI_REGISTRY_IMAGE}:${CI_COMMIT_TAG}` (tags Git)

## Execucao local do Docker

```bash
docker build -t worklyhub-frontend:local .
docker run --rm -p 8080:8080 worklyhub-frontend:local
```

Aplicacao disponivel em `http://localhost:8080`.
