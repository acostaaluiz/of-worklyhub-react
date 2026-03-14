type LogoutSeed = {
  uid: string;
  email: string;
  workspaceId: string;
};

function createSeed(): LogoutSeed {
  return {
    uid: "uid-cypress-logout",
    email: "cypress.logout@worklyhub.dev",
    workspaceId: "ws-cypress-logout",
  };
}

function mockLogoutFlowApis(seed: LogoutSeed): void {
  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        uid: seed.uid,
        email: seed.email,
        planId: 3,
        planTitle: "Premium",
        planStatus: "ACTIVE-PLAN",
      },
      modules: [
        { uid: "dashboard", name: "Dashboard", icon: "dashboard" },
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

describe("Logout flow", () => {
  it("signs out from user menu, redirects to /login and clears persisted session", () => {
    const seed = createSeed();
    mockLogoutFlowApis(seed);

    cy.visit("/home", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-logout-id-token");
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
            name: "Cypress Logout Workspace",
          })
        );
      },
    });

    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.get(".user-avatar").click({ force: true });
    cy.contains(".ant-dropdown .ant-dropdown-menu-item", "Sign out").click({
      force: true,
    });

    cy.location("pathname", { timeout: 40000 }).should("eq", "/login");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("auth.session")).to.eq(null);
      expect(win.localStorage.getItem("company.workspace")).to.eq(null);
      expect(win.localStorage.getItem("users.overview")).to.eq(null);
    });
  });
});

export {};
