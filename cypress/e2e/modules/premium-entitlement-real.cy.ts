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
const credentials = readCredentials("premiumEmail", "premiumPassword");

const describeReal = runRealEntitlement ? describe : describe.skip;

describeReal("Real premium entitlement (backend + DB real)", () => {
  before(() => {
    assertRequiredCredentials(
      credentials,
      "CYPRESS_PREMIUM_EMAIL",
      "CYPRESS_PREMIUM_PASSWORD"
    );
  });

  it("logs in, validates Growth + SLA in /modules and can access /growth", () => {
    loginWithCredentials(credentials);

    fetchOverview(apiBaseUrl).then(({ profile, modules }) => {
      const planId = Number(profile.planId);
      const planTitle = String(profile.planTitle ?? "").toLowerCase();
      expect(
        planId === 3 || planTitle.includes("premium"),
        "expected PREMIUM plan in /me/overview"
      ).to.eq(true);

      const modulesText = moduleText(modules);
      expect(modulesText, "expected Growth module in /me/overview").to.include("growth");
      expect(modulesText, "expected SLA module in /me/overview").to.include("sla");
    });

    cy.visit("/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    allModuleCardsText().then((cardsText) => {
      expect(cardsText, "Growth card should be visible for PREMIUM").to.include("growth");
      expect(cardsText, "SLA card should be visible for PREMIUM").to.include("sla");
    });

    cy.visit("/growth");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/growth(\/|$)/);
    cy.get('[data-cy="growth-autopilot-page"]', { timeout: 30000 }).should(
      "be.visible"
    );
  });
});

export {};
