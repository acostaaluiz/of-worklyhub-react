type E2eUserSeed = {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  legalName: string;
  primaryService: string;
  primaryCategory: string;
  industry: string;
  launchServiceName: string;
};

function createSeed(): E2eUserSeed {
  const unique = Date.now();
  return {
    fullName: `Cypress User ${unique}`,
    email: `cypress+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    companyName: `Cypress Company ${unique}`,
    legalName: `Cypress Legal ${unique}`,
    primaryService: "Preventive maintenance",
    primaryCategory: "maintenance",
    industry: "services",
    launchServiceName: "Initial service package",
  };
}

function mockOnboardingNetwork(seed: E2eUserSeed): void {
  let workspace: Record<string, unknown> | null = null;

  cy.intercept("POST", "**/internal/auth/register", (req) => {
    req.reply({
      statusCode: 201,
      body: {
        uid: "uid-cypress-owner",
        email: seed.email,
      },
    });
  }).as("registerRequest");

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    (req) => {
      req.reply({
        statusCode: 200,
        body: {
          kind: "identitytoolkit#VerifyPasswordResponse",
          localId: "uid-cypress-owner",
          email: seed.email,
          displayName: seed.fullName,
          idToken: "cypress-firebase-id-token",
          refreshToken: "cypress-firebase-refresh-token",
          expiresIn: "3600",
          registered: true,
        },
      });
    }
  ).as("firebaseSignInRequest");

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup.*/,
    {
      statusCode: 200,
      body: {
        users: [
          {
            localId: "uid-cypress-owner",
            email: seed.email,
            displayName: seed.fullName,
            emailVerified: true,
          },
        ],
      },
    }
  ).as("firebaseLookupRequest");

  cy.intercept("POST", "**/internal/auth/verify-token", (req) => {
    expect(String(req.headers.authorization ?? "")).to.include("Bearer ");
    req.reply({
      statusCode: 200,
      body: {
        uid: "uid-cypress-owner",
        claims: {
          role: "owner",
        },
      },
    });
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.fullName,
      email: seed.email,
      planId: 1,
      planTitle: "Starter",
    },
  }).as("userProfileRequest");

  cy.intercept("GET", "**/internal/application/categories", {
    statusCode: 200,
    body: {
      categories: [
        { uid: seed.primaryCategory, name: "Maintenance" },
        { uid: "beauty", name: "Beauty" },
      ],
    },
  }).as("categoriesRequest");

  cy.intercept("GET", "**/internal/application/industries", {
    statusCode: 200,
    body: {
      industries: [
        { uid: seed.industry, name: "Services" },
        { uid: "retail", name: "Retail" },
      ],
    },
  }).as("industriesRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: { workspace },
    });
  }).as("workspaceRequest");

  cy.intercept("POST", /\/company\/internal\/workspaces$/, (req) => {
    workspace = {
      id: "ws-cypress-001",
      workspaceId: "ws-cypress-001",
      name: seed.companyName,
      fullName: seed.fullName,
      email: seed.email,
      accountType: "company",
      tradeName: seed.companyName,
      legalName: seed.legalName,
      industry: seed.industry,
      primaryService: seed.primaryService,
      description: "Cypress onboarding run",
      company_profile: {
        trade_name: seed.companyName,
        legal_name: seed.legalName,
        industry: seed.industry,
        primary_service: seed.primaryService,
        description: "Cypress onboarding run",
      },
    };

    req.reply({
      statusCode: 201,
      body: workspace,
    });
  }).as("createWorkspaceRequest");

  cy.intercept("GET", "**/me/overview", {
    statusCode: 200,
    body: {
      profile: {
        name: seed.fullName,
        email: seed.email,
        planTitle: "Starter",
      },
      modules: [
        { uid: "schedule", name: "Schedule", icon: "calendar" },
        { uid: "finance", name: "Finance", icon: "dollar-sign" },
        { uid: "inventory", name: "Inventory", icon: "box" },
      ],
    },
  }).as("overviewRequest");
}

describe("Auth + Company setup", () => {
  it("registers, logs in and completes company setup", () => {
    const seed = createSeed();
    mockOnboardingNetwork(seed);

    cy.visit("/register");
    cy.getBySel("register-form").should("be.visible");
    cy.getBySel("register-name-input").type(seed.fullName);
    cy.getBySel("register-email-input").type(seed.email);
    cy.getBySel("register-password-input").type(seed.password, { log: false });
    cy.getBySel("register-confirm-password-input").type(seed.password, {
      log: false,
    });
    cy.getBySel("register-accept-terms").click({ force: true });
    cy.getBySel("register-submit-button").click();
    cy.wait("@registerRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);

    cy.get('[data-cy="response-modal"]', { timeout: 30000 }).should("be.visible");
    cy.contains("Account created", { timeout: 30000 }).should("be.visible");
    cy.getBySel("response-modal-primary-button").click();
    cy.location("pathname", { timeout: 30000 }).should("eq", "/login");

    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();
    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });

    cy.location("pathname", { timeout: 40000 }).should(
      "eq",
      "/company/introduction"
    );
    cy.getBySel("company-setup-wizard").should("be.visible");
    cy.wait("@categoriesRequest", { timeout: 30000 });
    cy.wait("@industriesRequest", { timeout: 30000 });

    cy.getBySel("wizard-step-owner").should("be.visible");
    cy.getBySel("company-setup-full-name-input").clear().type(seed.fullName);
    cy.getBySel("company-setup-email-input").clear().type(seed.email);
    cy.getBySel("company-setup-phone-input").type("11999999999");
    cy.getBySel("wizard-next-button").click({ force: true });

    cy.getBySel("wizard-step-company").should("be.visible");
    cy.getBySel("company-setup-account-type-company").click({ force: true });
    cy.getBySel("company-setup-company-name-input").type(seed.companyName);
    cy.getBySel("company-setup-legal-name-input").type(seed.legalName);
    cy.getBySel("company-setup-employees-input").then(($element) => {
      const input = $element.is("input") ? $element : $element.find("input");
      cy.wrap(input).type("10");
    });
    cy.getBySel("wizard-next-button").click({ force: true });

    cy.getBySel("wizard-step-market").should("be.visible");
    cy.getBySel("company-setup-primary-service-input").type(seed.primaryService);
    cy.getBySel("company-setup-primary-service-category-select").click({ force: true });
    cy.contains(".ant-select-dropdown:visible .ant-select-item-option", "Maintenance").click({
      force: true,
    });
    cy.getBySel("company-setup-industry-select").click({ force: true });
    cy.contains(".ant-select-dropdown:visible .ant-select-item-option", "Services").click({
      force: true,
    });
    cy.getBySel("company-setup-description-input").type(
      "Cypress onboarding run"
    );
    cy.getBySel("wizard-next-button").click({ force: true });

    cy.getBySel("wizard-step-launch-services").should("be.visible");
    cy.getBySel("launch-service-name-input-0").type(seed.launchServiceName);
    cy.getBySel("wizard-next-button").click({ force: true });

    cy.getBySel("wizard-step-summary").should("be.visible");
    cy.contains('[role="tab"]', "Overview").click();
    cy.contains('[role="tab"]', "Market").click();
    cy.contains('[role="tab"]', "Services").click();
    cy.getBySel("wizard-finish-button").click({ force: true });
    cy.wait("@createWorkspaceRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);

    cy.contains("Setup complete", { timeout: 30000 }).should("be.visible");
    cy.getBySel("response-modal-primary-button").click();

    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("company.workspace")).to.not.equal(null);
    });
  });
});

export {};
