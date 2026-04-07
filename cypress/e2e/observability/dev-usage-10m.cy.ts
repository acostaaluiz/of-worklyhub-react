import {
  assertRequiredCredentials,
  loginWithCredentials,
  readCredentials,
} from "../modules/real-entitlement.helpers";

const credentials = readCredentials("premiumEmail", "premiumPassword");

const SESSION_DURATION_MS = 10 * 60 * 1000;
const WAIT_BETWEEN_NAVIGATIONS_MS = 8_000;
const NAVIGATION_PATHS = [
  "/home",
  "/schedule",
  "/modules",
  "/users",
  "/billing",
  "/work-order",
  "/finance",
  "/growth",
];

function runNavigationLoop(endAt: number, iteration = 0): void {
  if (Date.now() >= endAt) return;

  const path = NAVIGATION_PATHS[iteration % NAVIGATION_PATHS.length];

  cy.log(`usage-loop iteration=${iteration} path=${path}`);
  cy.visit(path, { failOnStatusCode: false, timeout: 60_000 });
  cy.location("pathname", { timeout: 60_000 }).should("not.eq", "/login");
  cy.wait(WAIT_BETWEEN_NAVIGATIONS_MS);

  cy.then(() => runNavigationLoop(endAt, iteration + 1));
}

describe("DEV observability usage simulation (10m)", () => {
  before(() => {
    assertRequiredCredentials(
      credentials,
      "CYPRESS_PREMIUM_EMAIL",
      "CYPRESS_PREMIUM_PASSWORD"
    );
  });

  it("keeps a real authenticated user session active for 10 minutes", () => {
    loginWithCredentials(credentials);
    const endAt = Date.now() + SESSION_DURATION_MS;
    runNavigationLoop(endAt);
  });
});

export {};

