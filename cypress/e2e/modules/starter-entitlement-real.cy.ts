import {
  allModuleCardsText,
  assertRequiredCredentials,
  fetchOverview,
  loginWithCredentials,
  moduleText,
  readApiBaseUrl,
  readCredentials,
  toBooleanEnv,
} from "./real-entitlement.helpers";

const runRealEntitlement = toBooleanEnv(Cypress.env("runRealEntitlement"));
const apiBaseUrl = readApiBaseUrl();
const credentials = readCredentials("starterEmail", "starterPassword");

const describeReal = runRealEntitlement ? describe : describe.skip;

describeReal("Real starter entitlement (backend + DB real)", () => {
  before(() => {
    assertRequiredCredentials(
      credentials,
      "CYPRESS_STARTER_EMAIL",
      "CYPRESS_STARTER_PASSWORD"
    );
  });

  it("logs in and validates Starter modules with blocked Growth and SLA access", () => {
    loginWithCredentials(credentials);

    fetchOverview(apiBaseUrl).then(({ profile, modules }) => {
      const planId = Number(profile.planId);
      const planTitle = String(profile.planTitle ?? "").toLowerCase();
      expect(
        planId === 1 || planTitle.includes("starter"),
        "expected STARTER plan in /me/overview"
      ).to.eq(true);

      const modulesText = moduleText(modules);

      ["billing", "clients", "company", "dashboard", "schedule", "services"].forEach(
        (requiredModule) => {
          expect(
            modulesText,
            `expected ${requiredModule} module in /me/overview`
          ).to.include(requiredModule);
        }
      );

      ["finance", "inventory", "people", "work-order", "growth", "sla"].forEach(
        (blockedModule) => {
          expect(
            modulesText,
            `did not expect ${blockedModule} module in /me/overview`
          ).to.not.include(blockedModule);
        }
      );
    });

    cy.visit("/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    allModuleCardsText().then((cardsText) => {
      ["billing", "clients", "company", "dashboard", "schedule", "services"].forEach(
        (requiredCard) => {
          expect(cardsText, `expected ${requiredCard} card for STARTER`).to.include(
            requiredCard
          );
        }
      );

      ["finance", "inventory", "people", "work order", "growth", "sla"].forEach(
        (blockedCard) => {
          expect(cardsText, `did not expect ${blockedCard} card for STARTER`).to.not.include(
            blockedCard
          );
        }
      );
    });

    cy.visit("/growth");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/modules(\/|$)/);

    cy.visit("/company/slas");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/modules(\/|$)/);
  });
});

export {};
