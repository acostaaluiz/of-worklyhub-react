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
const credentials = readCredentials("standardEmail", "standardPassword");

const describeReal = runRealEntitlement ? describe : describe.skip;

describeReal("Real standard entitlement (backend + DB real)", () => {
  before(() => {
    assertRequiredCredentials(
      credentials,
      "CYPRESS_STANDARD_EMAIL",
      "CYPRESS_STANDARD_PASSWORD"
    );
  });

  it("logs in and validates Standard modules with blocked Growth and SLA access", () => {
    loginWithCredentials(credentials);

    fetchOverview(apiBaseUrl).then(({ profile, modules }) => {
      const planId = Number(profile.planId);
      const planTitle = String(profile.planTitle ?? "").toLowerCase();
      expect(
        planId === 2 || planTitle.includes("standard"),
        "expected STANDARD plan in /me/overview"
      ).to.eq(true);

      const modulesText = moduleText(modules);

      [
        "billing",
        "clients",
        "company",
        "dashboard",
        "finance",
        "inventory",
        "people",
        "schedule",
        "services",
        "work-order",
      ].forEach((requiredModule) => {
        expect(
          modulesText,
          `expected ${requiredModule} module in /me/overview`
        ).to.include(requiredModule);
      });

      ["growth", "sla"].forEach((blockedModule) => {
        expect(
          modulesText,
          `did not expect ${blockedModule} module in /me/overview`
        ).to.not.include(blockedModule);
      });
    });

    cy.visit("/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    allModuleCardsText().then((cardsText) => {
      [
        "billing",
        "clients",
        "company",
        "dashboard",
        "finance",
        "inventory",
        "people",
        "schedule",
        "services",
        "work order",
      ].forEach((requiredCard) => {
        expect(cardsText, `expected ${requiredCard} card for STANDARD`).to.include(
          requiredCard
        );
      });

      ["growth", "sla"].forEach((blockedCard) => {
        expect(cardsText, `did not expect ${blockedCard} card for STANDARD`).to.not.include(
          blockedCard
        );
      });
    });

    cy.visit("/growth");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/modules(\/|$)/);

    cy.visit("/company/slas");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/modules(\/|$)/);
  });
});

export {};
