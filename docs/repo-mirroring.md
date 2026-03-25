# Repo Mirroring (GitHub <-> GitLab)

Este repositório possui espelhamento automático entre os remotos:

- GitHub -> GitLab: `.github/workflows/mirror-to-gitlab.yml`
- GitLab -> GitHub: job `mirror_to_github` em `.gitlab-ci.yml`

## Branches espelhadas

- `develop`
- `master`

## Variáveis necessárias

### GitHub Actions (Settings > Secrets and variables > Actions)

- `GITLAB_MIRROR_TOKEN`: token com permissão de push no repositório GitLab `acosta.aluiz/of-worklyhub-react`.

### GitLab CI/CD (Settings > CI/CD > Variables)

- `GITHUB_MIRROR_TOKEN`: token com permissão `repo` para push no repositório GitHub `acostaaluiz/of-worklyhub-react`.

## Observação

Se o token de um lado não estiver configurado, o job correspondente é ignorado para não bloquear o deploy.
