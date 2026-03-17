# WorklyHub IaC Readiness Assessment (Firebase x GCP)

Data da avaliacao: 2026-03-17

## Escopo analisado

- Frontend: `D:\OF Consulting\of-worklyhub-react`
- Backend: `D:\OF Consulting\of-worklyhub-node`
- Projetos alvo:
  - GCP runtime: `worklyhub`
  - Firebase: `worklyhub-9735f`

## Diagnostico inicial (antes das mudancas)

1. Frontend ja tinha Terraform Cloud Run, mas sem padrao explicito para caminho de credencial Terraform.
2. Backend nao tinha stack Terraform de deploy para Cloud Run/Secret Manager/Artifact Registry.
3. Existia credencial Firebase Admin JSON versionada no backend (alto risco operacional).
4. Nao havia padrao de segregacao de servicos internos x endpoint publico para microservicos no GCP.

## Entregas implementadas

### Frontend (Terraform)

- Padrao de credencial adicionada em `develop/master`:
  - `google_credentials_file` (com fallback para ADC quando vazio).
- `terraform.tfvars.example` atualizado para facilitar substituicao.
- `infra/README.md` atualizado com passo de credencial antes do apply.

### Backend (Terraform completo)

Nova stack em `infra/terraform/` com:

- Modulo reutilizavel de Cloud Run (`modules/cloud-run-service`).
- Modulo orquestrador backend (`modules/worklyhub-backend`) com:
  - Artifact Registry
  - Runtime Service Account
  - Secret Manager (segredos vindos de `secret_values`)
  - 13 servicos Cloud Run com roteamento interno entre servicos
  - `orchestrator` como unico endpoint publico
  - IAM cross-project opcional para Firebase (`worklyhub-9735f`)
- Ambientes:
  - `infra/terraform/environments/develop`
  - `infra/terraform/environments/master`
- Exemplos de vars com placeholders substituiveis (`terraform.tfvars.example`).

### Backend (hardening de runtime Firebase)

Nos servicos `auth`, `company`, `finance`, `users` e `work-order`:

- Mantido suporte a `FIREBASE_CREDENTIALS_PATH` e `FIREBASE_CREDENTIALS`.
- Adicionado fallback para `applicationDefault()` + `FIREBASE_PROJECT_ID`/bucket.
- Permite operacao segura sem chave JSON em arquivo quando rodando no Cloud Run com IAM correto.

### Hygiene de segredos

- `.gitignore` do backend atualizado para bloquear:
  - artefatos Terraform
  - JSON de credenciais em `infra/firebase/*.json`
  - JSON em `apps/*/*/secrets/*.json`

## Modelo de custo recomendado (baixo custo inicial)

- Cloud Run com `min_instance_count = 0` (scale-to-zero).
- Limites baixos por default (CPU/memoria enxutos).
- Apenas `orchestrator` publico.
- Servicos internos com `INGRESS_TRAFFIC_INTERNAL_ONLY`.

## Controles de seguranca aplicados

- Segredos centralizados em Secret Manager (ao inves de arquivo no repositorio).
- Runtime com Service Account dedicada.
- IAM minimo para leitura de segredos e imagens.
- IAM cross-project para Firebase (quando habilitado).

## Acoes obrigatorias pendentes para ir a producao com seguranca

1. Rotacionar imediatamente qualquer chave Firebase que ja tenha sido versionada anteriormente.
2. Preencher `terraform.tfvars` de `develop/master` com segredos reais (sem commit).
3. Configurar bucket remoto de state Terraform (GCS) e aplicar lock/politica de acesso.
4. Validar politicas de pagamento (MercadoPago/PayPal) e webhook URLs em segredos.
5. Configurar pipeline CI para build/push de cada servico backend (imagens reais) antes do deploy final.
