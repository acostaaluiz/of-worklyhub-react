# 📄 Documento de Produto — V1

## Hub de Gestão para Negócios de Serviço

**O.F. Consulting**

---

## 1. Visão do Produto

Criar um sistema online de gestão operacional para pequenos e médios negócios de serviço, permitindo que empresas gerenciem agenda, clientes, profissionais e financeiro básico em um único lugar, de forma simples, configurável e escalável.

O produto será oferecido no modelo SaaS (Software as a Service), com cobrança mensal por assinatura.

---

## 2. Problema a Ser Resolvido

Hoje, a maioria dos negócios de serviço opera com:

- WhatsApp para agendamento
- Google Agenda ou papel
- Planilhas para controle financeiro
- Falta de visão do negócio
- Processos manuais e descentralizados

Isso gera:

- Perda de tempo
- Erros financeiros
- Agenda mal aproveitada
- Falta de histórico e dados

---

## 3. Público-Alvo (V1)

Negócios de serviço que dependem de agenda e atendimento humano, como:

- Estúdios (tatuagem, estética, barbearia)
- Clínicas pequenas
- Profissionais autônomos
- Escolas de pequeno porte
- Prestadores de serviço recorrente

Fora do escopo da V1:

- Varejo
- Restaurante
- PDV fiscal
- E-commerce

---

## 4. Proposta de Valor

Centralize agenda, clientes e financeiro do seu negócio em um sistema simples, sem planilhas e sem complicação.

Principais benefícios:

- Organização operacional
- Visibilidade financeira
- Ganho de tempo
- Padronização de processos
- Base sólida para crescimento

---

## 5. Princípios do Produto

1. Agenda é o centro do negócio
2. Configuração é melhor que customização
3. Simplicidade antes de poder
4. Financeiro operacional, não contábil
5. Produto genérico por design, específico por configuração

---

## 6. Estrutura Modular do Produto (V1)

Core

- Empresa
- Usuários & Perfis
- Clientes
- Serviços
- Agenda
- Financeiro
- Dashboard

---

## 7. Processos da V1

### 7.1 Cadastro da Empresa

Objetivo: contextualizar o sistema para cada cliente.

Funcionalidades:

- Cadastro da empresa
- Seleção da categoria do negócio
- Horário de funcionamento
- Dias de atendimento
- Fuso horário

Observação:  
A categoria da empresa define nomenclaturas, comportamentos e habilitação futura de módulos.

---

### 7.2 Gestão de Usuários e Perfis

Objetivo: controle de acesso e responsabilidades.

Perfis V1:

- Administrador (dono)
- Profissional
- Operador (opcional)

Funcionalidades:

- Convite por e-mail
- Ativação e desativação
- Associação à empresa
- Permissões básicas

---

### 7.3 Cadastro de Clientes

Objetivo: manter histórico e relacionamento.

Funcionalidades:

- Cadastro básico
- Observações livres
- Histórico de atendimentos
- Status ativo ou inativo

Campos V1:

- Nome
- Contato
- Observações

---

### 7.4 Cadastro de Serviços / Atividades

Objetivo: definir o que é vendido ou agendado.

Funcionalidades:

- Cadastro de serviços
- Duração
- Valor
- Associação a profissionais
- Status ativo ou inativo

Campos principais:

- Nome
- Categoria
- Tempo estimado
- Preço base

---

### 7.5 Agenda (Processo Central)

Objetivo: organizar atendimentos.

Funcionalidades V1:

- Visualização diária e semanal
- Agendamento manual
- Vínculo com cliente, serviço e profissional
- Status do agendamento:
  - Agendado
  - Confirmado
  - Cancelado
  - Realizado

Regras:

- Respeitar horário de funcionamento
- Evitar conflitos de agenda

---

### 7.6 Financeiro Básico (Caixa)

Objetivo: dar visibilidade financeira sem complexidade.

Funcionalidades:

- Registro automático ao concluir atendimento
- Lançamentos manuais
- Entradas e saídas
- Caixa diário
- Total mensal

Relatórios V1:

- Faturamento mensal
- Resumo diário de caixa

---

### 7.7 Dashboard

Objetivo: visão rápida e executiva do negócio.

Indicadores V1:

- Faturamento do mês
- Próximos atendimentos
- Quantidade de atendimentos realizados
- Serviços mais executados

---

## 8. Fluxos Críticos da V1

Fluxo 1 — Onboarding

1. Cadastro do usuário
2. Criação da empresa
3. Seleção da categoria
4. Cadastro inicial de serviços
5. Primeiro agendamento

Fluxo 2 — Atendimento

1. Agendamento
2. Atendimento realizado
3. Registro automático no financeiro

Fluxo 3 — Operação diária

1. Visualização da agenda
2. Execução dos atendimentos
3. Acompanhamento do caixa

---

## 9. Fora do Escopo da V1

Explicitamente não incluído na V1:

- Estoque
- PDV fiscal
- Nota fiscal
- Integrações bancárias
- App mobile
- Automação de WhatsApp
- Inteligência artificial
- Multi-unidade
- Relatórios avançados

---

## 10. Monetização

Modelo: assinatura mensal (SaaS)

Planos iniciais (sugestão):

- Starter
- Pro
- Business

Critérios de cobrança:

- Número de profissionais
- Módulos habilitados
- Volume de uso (futuro)

---

## 11. Visão de Evolução

V2:

- Confirmação automática de agendamentos
- Pagamentos online
- Relatórios avançados
- Estoque simples
- Exportações de dados

V3:

- Aplicativo mobile
- Automação de mensagens
- Multi-unidade
- Marketplace
- Inteligência de dados e previsões

---

## 12. Métricas de Sucesso (V1)

- Tempo médio de onboarding
- Taxa de ativação
- Uso da agenda
- Uso do financeiro
- Churn mensal
- Ticket médio por cliente

---

## 13. Status do Documento

Documento de Visão e Escopo da V1, servindo como base para:

- Roadmap do produto
- Arquitetura técnica
- UX e UI
- Planejamento de desenvolvimento

---

## Instalação e execução local (desenvolvedores)

Seguem instruções rápidas para configurar o ambiente de desenvolvimento local.

- Pré-requisitos:
  - Node.js 18+ recomendado
  - npm (vem com o Node) — `npm` também funciona bem

- Clonar o repositório:

```bash
git clone <repo-url>
cd of-worklyhub-react
```

- Instalar dependências:

```bash
npm install
# ou, se preferir instalação determinística em CI:
npm ci
```

- Variáveis de ambiente:
  - Esta aplicação usa variáveis `VITE_*` (por exemplo `VITE_CURRENCY_LOCALE`, `VITE_FINANCE_ALERT_MIN`).
  - Crie um arquivo `.env` ou `.env.local` na raiz com as chaves necessárias. Exemplo mínimo:

```text
# .env.local
VITE_CURRENCY_LOCALE=en-US
VITE_CURRENCY_CODE=USD
VITE_CURRENCY_PRECISION=2
# VITE_FINANCE_ALERT_MIN=...
# VITE_FINANCE_ALERT_MAX=...
```

- Executar em modo de desenvolvimento (Vite):

```bash
npm run dev
```

- Build de produção:

```bash
npm run build
```

- Rodar linter:

```bash
npm run lint
# para aplicar correções automáticas quando possível:
npm run lint -- --fix
```

- Preview do build:

```bash
npm run preview
```

- Commits e hooks:
  - Este repositório usa `husky`, `lint-staged` e `commitizen`.
  - Configure hooks com `npm run prepare` (geralmente já executado ao instalar).
  - Para criar um commit seguindo o padrão, execute:

```bash
npm run commit
```

- Dicas adicionais:
  - Use `npm run build` antes de abrir um PR para garantir que a compilação TypeScript está OK.
  - Execute `npm run lint` e corrija problemas antes de subir o branch.
