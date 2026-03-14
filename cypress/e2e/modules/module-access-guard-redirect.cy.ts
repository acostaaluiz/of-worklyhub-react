type ModuleGuardSeed = {
  uid: string;
  email: string;
  workspaceId: string;
};

function createSeed(): ModuleGuardSeed {
  return {
    uid: "uid-cypress-module-guard",
    email: "cypress.module.guard@worklyhub.dev",
    workspaceId: "ws-cypress-module-guard",
  };
}

function mockModuleGuardApis(seed: ModuleGuardSeed): void {
  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        uid: seed.uid,
        email: seed.email,
        planId: 2,
        planTitle: "Standard",
        planStatus: "ACTIVE-PLAN",
      },
      modules: [
        { uid: "dashboard", name: "Dashboard", icon: "dashboard" },
        { uid: "finance", name: "Finance", icon: "dollar-sign" },
        { uid: "schedule", name: "Schedule", icon: "calendar" },
      ],
    },
  }).as("overviewRequest");

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

describe("Module access guard", () => {
  it("redirects from blocked module route to /modules when plan is active but module is not enabled", () => {
    const seed = createSeed();
    mockModuleGuardApis(seed);

    cy.visit("/growth", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-module-guard-id-token");
        win.localStorage.setItem(
          "auth.session",
          JSON.stringify({
            uid: seed.uid,
            claims: {},
            email: seed.email,
          })
        );
        win.localStorage.setItem(
          "company.workspace",
          JSON.stringify({
            id: seed.workspaceId,
            workspaceId: seed.workspaceId,
            email: seed.email,
          })
        );
      },
    });

    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    cy.get('[data-cy="all-modules-card"][data-module-id="finance"]').should("exist");
    cy.get('[data-cy="all-modules-card"][data-module-id="growth"]').should("not.exist");
  });
});

export {};
