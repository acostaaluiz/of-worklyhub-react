type PersistedSessionSeed = {
  uid: string;
  email: string;
  name: string;
  workspaceId: string;
};

function createSeed(): PersistedSessionSeed {
  return {
    uid: "uid-cypress-persisted-session",
    email: "cypress.persisted.premium@worklyhub.dev",
    name: "Cypress Persisted Premium",
    workspaceId: "ws-cypress-persisted-premium",
  };
}

function mockPersistedSessionApis(seed: PersistedSessionSeed): void {
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
      modules: [
        { uid: "billing", name: "Billing" },
        { uid: "company", name: "Company" },
        { uid: "dashboard", name: "Dashboard" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, (request) => {
    expect(
      request.url,
      "workspace lookup should use email resolved from overview profile"
    ).to.include(`email=${encodeURIComponent(seed.email)}`);

    request.reply({
      statusCode: 200,
      body: {
        workspace: {
          id: seed.workspaceId,
          workspaceId: seed.workspaceId,
          email: seed.email,
          name: "Cypress Persisted Workspace",
          tradeName: "Cypress Persisted Workspace",
        },
      },
    });
  }).as("workspaceRequest");

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

describe("Persisted session redirect with active plan", () => {
  it("redirects authenticated premium user directly to /home instead of /billing/plans", () => {
    const seed = createSeed();
    mockPersistedSessionApis(seed);

    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-persisted-id-token");
        // intentionally no `email` to simulate legacy persisted session payload
        win.localStorage.setItem(
          "auth.session",
          JSON.stringify({
            uid: seed.uid,
            claims: {},
          })
        );
      },
    });

    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.wait("@workspaceRequest", { timeout: 30000 });

    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");
    cy.location("pathname").should("not.eq", "/billing/plans");
  });
});

export {};
