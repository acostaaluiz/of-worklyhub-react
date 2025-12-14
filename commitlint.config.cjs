/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],

  rules: {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "hotfix", "release", "merge", "arch"],
    ],
    "scope-empty": [2, "never"],
    "subject-case": [2, "always", ["sentence-case", "lower-case"]],
  },

  prompt: {
    enableMultipleScopes: true,
    scopeEnumSeparator: ",",
    types: [
      { value: "feat", name: "feat:     Nova funcionalidade" },
      { value: "fix", name: "fix:      Correção de bug" },
      { value: "hotfix", name: "hotfix:   Correção crítica" },
      { value: "arch", name: "arch:     Mudança/decisão de arquitetura" },
      { value: "merge", name: "merge:    Merge/integração" },
      { value: "release", name: "release: Release/publicação" },
    ],

    scopes: [
      "auth",
      "users",
      "billing",
      "schedule",
      "company",
      "core",
      "app",
      "finance",
      "dashboard",
      "clients",
    ],

    messages: {
      type: "Tipo do commit:",
      scope: "Módulo(s) afetado(s):",
      subject: "Título curto (imperativo, sem ponto final):",
      body: "Descrição completa (opcional). Use \\n para quebrar linhas:",
      footer:
        "Área(s) de impacto (ex: arquitetura,infra,devex,devops,ui/ux) — opcional:",
      confirmCommit: "Confirmar e gerar o commit acima?",
    },
  },
};
