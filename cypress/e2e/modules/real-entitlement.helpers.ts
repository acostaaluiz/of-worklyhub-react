export type RealPlanCredentials = {
  email: string;
  password: string;
};

export type RealOverview = {
  profile: Record<string, unknown>;
  modules: Array<Record<string, unknown>>;
};

export function toBooleanEnv(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function readCredentials(
  emailEnvKey: string,
  passwordEnvKey: string
): RealPlanCredentials {
  return {
    email: String(Cypress.env(emailEnvKey) ?? "").trim(),
    password: String(Cypress.env(passwordEnvKey) ?? "").trim(),
  };
}

export function readApiBaseUrl(): string {
  const configured = String(Cypress.env("apiBaseUrl") ?? "").trim();
  const fallback = "http://localhost:3000/api/v1";
  return (configured || fallback).replace(/\/+$/, "");
}

export function assertRequiredCredentials(
  credentials: RealPlanCredentials,
  emailEnvName: string,
  passwordEnvName: string
): void {
  expect(
    credentials.email,
    `${emailEnvName} (or --env ...) is required when runRealEntitlement=true`
  ).to.not.equal("");
  expect(
    credentials.password,
    `${passwordEnvName} (or --env ...) is required when runRealEntitlement=true`
  ).to.not.equal("");
}

export function loginWithCredentials(credentials: RealPlanCredentials): void {
  cy.visit("/login");
  cy.getBySel("login-form").should("be.visible");
  cy.getBySel("login-email-input").clear().type(credentials.email);
  cy.getBySel("login-password-input").clear().type(credentials.password, {
    log: false,
  });
  cy.getBySel("login-submit-button").click();

  cy.location("pathname", { timeout: 45000 }).should("not.eq", "/login");
}

export function fetchOverview(apiBaseUrl: string): Cypress.Chainable<RealOverview> {
  return cy.window({ timeout: 45000 }).then((win) => {
    const token = win.localStorage.getItem("auth.idToken");
    expect(token, "auth.idToken should exist after login").to.be.a("string");
    expect((token ?? "").length, "auth.idToken should not be empty").to.be.greaterThan(
      0
    );

    return cy
      .request({
        method: "GET",
        url: `${apiBaseUrl}/me/overview`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an("object");

        const body = response.body as Record<string, unknown>;
        const profile = ((body.profile ?? {}) as Record<string, unknown>) ?? {};
        const moduleList = Array.isArray(body.modules) ? body.modules : [];
        const modules = moduleList.filter(
          (item): item is Record<string, unknown> =>
            Boolean(item) && typeof item === "object"
        );

        return { profile, modules };
      });
  });
}

export function moduleText(modules: Array<Record<string, unknown>>): string {
  return modules
    .flatMap((item) => [String(item.uid ?? ""), String(item.name ?? "")])
    .join(" ")
    .toLowerCase();
}

export function allModuleCardsText(): Cypress.Chainable<string> {
  return cy.getBySel("all-modules-card").then(($cards) => $cards.text().toLowerCase());
}
