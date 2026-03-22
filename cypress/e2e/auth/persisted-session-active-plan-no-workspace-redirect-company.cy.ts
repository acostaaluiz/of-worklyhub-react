type ActivePlanNoWorkspaceSeed = {
  uid: string;
  email: string;
  name: string;
};

function createSeed(): ActivePlanNoWorkspaceSeed {
  return {
    uid: "uid-cypress-active-no-workspace",
    email: "cypress.active.noworkspace@worklyhub.dev",
    name: "Cypress Active No Workspace",
  };
}

function mockActivePlanNoWorkspaceApis(seed: ActivePlanNoWorkspaceSeed): void {
  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        uid: seed.uid,
        name: seed.name,
        email: seed.email,
        planId: 3,
        planTitle: "Premium",
        planStatus: "ACTIVE-PLAN",
      },
      modules: [{ uid: "dashboard", name: "Dashboard" }],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, (request) => {
    expect(request.url).to.include(`email=${encodeURIComponent(seed.email)}`);
    request.reply({
      statusCode: 200,
      body: {
        workspace: null,
      },
    });
  }).as("workspaceRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.name,
      email: seed.email,
      planId: 3,
      planTitle: "Premium",
      planStatus: "ACTIVE-PLAN",
    },
  }).as("userProfileRequest");

  cy.intercept("GET", "**/internal/application/categories*", {
    statusCode: 200,
    body: {
      categories: [{ uid: "maintenance", name: "Maintenance" }],
    },
  }).as("categoriesRequest");

  cy.intercept("GET", "**/internal/application/industries*", {
    statusCode: 200,
    body: {
      industries: [{ uid: "services", name: "Services" }],
    },
  }).as("industriesRequest");

  cy.intercept("GET", "**/users/internal/users/notifications/summary*", {
    statusCode: 200,
    body: {
      summary: {
        unreadCount: 0,
        highPriorityUnreadCount: 0,
        totalActive: 0,
        lastGeneratedAt: new Date().toISOString(),
      },
    },
  }).as("notificationsSummaryRequest");
}

describe("Persisted session redirect with active plan and no workspace", () => {
  it("redirects to /company/introduction", () => {
    const seed = createSeed();
    mockActivePlanNoWorkspaceApis(seed);

    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-active-noworkspace-id-token");
        win.localStorage.setItem(
          "auth.session",
          JSON.stringify({
            uid: seed.uid,
            claims: {},
            email: seed.email,
          })
        );
      },
    });

    cy.wait("@workspaceRequest", { timeout: 30000 });

    cy.location("pathname", { timeout: 40000 }).should("eq", "/company/introduction");
    cy.getBySel("company-setup-wizard").should("be.visible");
    cy.wait("@categoriesRequest", { timeout: 30000 });
    cy.wait("@industriesRequest", { timeout: 30000 });
  });
});

export {};
