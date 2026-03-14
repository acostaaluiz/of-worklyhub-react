type InactivePlanSeed = {
  uid: string;
  email: string;
};

function createSeed(): InactivePlanSeed {
  return {
    uid: "uid-cypress-inactive-plan",
    email: "cypress.inactive@worklyhub.dev",
  };
}

function mockInactivePlanApis(seed: InactivePlanSeed): void {
  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        uid: seed.uid,
        email: seed.email,
        planId: null,
        planStatus: "INACTIVE-PLAN",
      },
      modules: [],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      email: seed.email,
      name: "Cypress Inactive",
      planId: null,
      planStatus: "INACTIVE-PLAN",
    },
  }).as("userProfileRequest");

  cy.intercept("GET", /\/api\/v1\/billing\/plans(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        plans: [
          {
            id: "starter",
            dbId: 1,
            name: "Starter",
            description: "Starter plan",
            currency: "USD",
            priceCents: { monthly: 2900, yearly: 29900 },
            features: ["Core modules"],
          },
          {
            id: "premium",
            dbId: 3,
            name: "Premium",
            description: "Premium plan",
            currency: "USD",
            priceCents: { monthly: 9900, yearly: 99900 },
            features: ["All modules"],
            recommended: true,
          },
        ],
        payment: {
          gateway: "mercadopago",
          configured: true,
          supportedMethods: ["card", "hosted"],
        },
      },
    },
  }).as("billingPlansRequest");
}

describe("Inactive plan route gate", () => {
  it("redirects authenticated user from private route to /billing/plans and keeps billing accessible", () => {
    const seed = createSeed();
    mockInactivePlanApis(seed);

    cy.visit("/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-inactive-id-token");
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

    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/billing/plans");
    cy.wait("@billingPlansRequest", { timeout: 30000 });
    cy.location("pathname").should("not.eq", "/dashboard");
  });
});

export {};
