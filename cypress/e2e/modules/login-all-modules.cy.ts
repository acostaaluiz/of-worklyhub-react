type ModulesSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
  planTitle: string;
};

function createSeed(): ModulesSeed {
  const unique = Date.now();
  return {
    email: `cypress.modules+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress Modules ${unique}`,
    workspaceId: "ws-cypress-modules-001",
    workspaceName: "Cypress Modules Workspace",
    planTitle: "Scale",
  };
}

function mockLoginAndModulesApis(seed: ModulesSeed): void {
  const nowIso = new Date().toISOString();
  const workspace = {
    id: seed.workspaceId,
    workspaceId: seed.workspaceId,
    name: seed.workspaceName,
    tradeName: seed.workspaceName,
    fullName: seed.fullName,
    email: seed.email,
    accountType: "company",
    company_profile: {
      trade_name: seed.workspaceName,
      description: "E2E workspace for modules listing",
    },
  };

  const overviewModules = [
    {
      uid: "company",
      name: "Company",
      description: "Configure workspace profile and setup.",
      icon: "briefcase",
    },
    {
      uid: "inventory",
      name: "Inventory",
      description: "Manage stock levels, alerts and categories.",
      icon: "box",
    },
    {
      uid: "people",
      name: "People",
      description: "Manage workers, schedules and assignments.",
      icon: "users",
    },
    {
      uid: "work-order",
      name: "Work order",
      description: "Plan and execute service orders.",
      icon: "clipboard-list",
    },
    {
      uid: "schedule",
      name: "Schedule",
      description: "Plan appointments and time slots.",
      icon: "calendar",
    },
    {
      uid: "finance",
      name: "Finance",
      description: "Track revenue and cash flow.",
      icon: "dollar-sign",
    },
    {
      uid: "growth-autopilot",
      name: "Growth",
      description: "Automate retention and reactivation.",
      icon: "sparkles",
    },
  ];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-modules-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-modules-firebase-id-token",
        refreshToken: "cypress-modules-firebase-refresh-token",
        expiresIn: "3600",
        registered: true,
      },
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
            localId: "uid-cypress-modules-owner",
            email: seed.email,
            displayName: seed.fullName,
            emailVerified: true,
          },
        ],
      },
    }
  ).as("firebaseLookupRequest");

  cy.intercept("POST", "**/internal/auth/verify-token", {
    statusCode: 200,
    body: {
      uid: "uid-cypress-modules-owner",
      claims: { role: "owner" },
    },
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.fullName,
      email: seed.email,
      planId: 3,
      planTitle: seed.planTitle,
    },
  }).as("userProfileRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, {
    statusCode: 200,
    body: { workspace },
  }).as("workspaceRequest");

  cy.intercept("GET", "**/users/internal/users/notifications/summary*", {
    statusCode: 200,
    body: {
      summary: {
        unreadCount: 0,
        highPriorityUnreadCount: 0,
        totalActive: 0,
        lastGeneratedAt: nowIso,
      },
    },
  }).as("notificationsSummaryRequest");

  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        name: seed.fullName,
        email: seed.email,
        planTitle: seed.planTitle,
      },
      modules: overviewModules,
    },
  }).as("overviewRequest");
}

describe("Login + Modules page", () => {
  it("logs in and loads all available modules page", () => {
    const seed = createSeed();
    mockLoginAndModulesApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    cy.getBySel("all-modules-showcase").should("be.visible");
    cy.getBySel("all-modules-hero").should("be.visible");
    cy.getBySel("all-modules-grid").should("be.visible");
    cy.getBySel("all-modules-card").should("have.length", 7);

    cy.contains("Company").should("be.visible");
    cy.contains("Inventory").should("be.visible");
    cy.contains("People").should("be.visible");
    cy.contains("Work order").should("be.visible");
    cy.contains("Schedule").should("be.visible");
    cy.contains("Finance").should("be.visible");
    cy.contains("Growth").should("be.visible");

    cy.contains("7 modules").should("be.visible");
    cy.contains("7 available now").should("be.visible");
  });
});

export {};
