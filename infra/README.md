# Infra GCP (Terraform)

Infraestrutura para hospedar o frontend no GCP com:

- Artifact Registry (imagens Docker)
- Cloud Run (servico web)
- Service Account de runtime
- IAM para leitura do Artifact Registry e invocacao publica opcional

## Estrutura

```text
infra/
  cloudbuild/
    cloudbuild.frontend.yaml
  modules/
    cloud-run-frontend/
  environments/
    develop/
    master/
```

## Mapeamento de ambientes

- `develop` -> desenvolvimento
- `master` -> producao

Cada ambiente tem seu proprio estado Terraform e valores.

## Pre-requisitos

- Terraform `>= 1.6`
- Projeto GCP com faturamento ativo
- Permissoes para criar:
  - Artifact Registry
  - Cloud Run
  - IAM
  - Service Accounts

## Backend remoto (GCS)

Cada ambiente usa `backend "gcs" {}`.
No `terraform init`, informe bucket/prefix:

```bash
terraform init \
  -backend-config="bucket=<state-bucket>" \
  -backend-config="prefix=worklyhub/frontend/develop"
```

Para producao, troque o prefix para `worklyhub/frontend/master`.

## Comandos

Antes de executar:

- Preencha `google_credentials_file` no `terraform.tfvars` com o caminho da chave JSON de deploy
  (ou deixe vazio e use ADC com `gcloud auth application-default login`).

### Develop

```bash
cd infra/environments/develop
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config="bucket=<state-bucket>" -backend-config="prefix=worklyhub/frontend/develop"
terraform plan
terraform apply
```

### Master

```bash
cd infra/environments/master
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config="bucket=<state-bucket>" -backend-config="prefix=worklyhub/frontend/master"
terraform plan
terraform apply
```

## Integracao com CI

O pipeline GitLab usa:

- `infra/cloudbuild/cloudbuild.frontend.yaml` para build/push da imagem
- deploy em Cloud Run nas branches `develop` e `master`

Variaveis de CI exigidas por ambiente:

- `GCP_PROJECT_ID_DEVELOP` / `GCP_PROJECT_ID_MASTER`
- `GCP_REGION_DEVELOP` / `GCP_REGION_MASTER`
- `GCP_ARTIFACT_REGISTRY_REPOSITORY_DEVELOP` / `GCP_ARTIFACT_REGISTRY_REPOSITORY_MASTER`
- `GCP_CLOUD_RUN_SERVICE_DEVELOP` / `GCP_CLOUD_RUN_SERVICE_MASTER`
- `GCP_SERVICE_ACCOUNT_KEY_DEVELOP` / `GCP_SERVICE_ACCOUNT_KEY_MASTER`
- `VITE_API_BASE_URL_DEVELOP` / `VITE_API_BASE_URL_MASTER`
- `VITE_CURRENCY_LOCALE_DEVELOP` / `VITE_CURRENCY_LOCALE_MASTER` (opcional)
- `VITE_CURRENCY_CODE_DEVELOP` / `VITE_CURRENCY_CODE_MASTER` (opcional)
- `VITE_CURRENCY_PRECISION_DEVELOP` / `VITE_CURRENCY_PRECISION_MASTER` (opcional)
