const { defineConfig } = require("cypress");

const baseUrl = process.env.CYPRESS_BASE_URL || "http://localhost:4173";

module.exports = defineConfig({
  viewportWidth: 1536,
  viewportHeight: 900,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  responseTimeout: 30000,
  video: true,
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  env: {
    e2ePassword: process.env.CYPRESS_E2E_PASSWORD || "WorklyHub123!",
    apiBaseUrl: process.env.CYPRESS_API_BASE_URL || "http://localhost:3000/api/v1",
    runRealEntitlement: process.env.CYPRESS_RUN_REAL_ENTITLEMENT || "false",
    premiumEmail: process.env.CYPRESS_PREMIUM_EMAIL || "",
    premiumPassword: process.env.CYPRESS_PREMIUM_PASSWORD || "",
    starterEmail: process.env.CYPRESS_STARTER_EMAIL || "",
    starterPassword: process.env.CYPRESS_STARTER_PASSWORD || "",
    standardEmail: process.env.CYPRESS_STANDARD_EMAIL || "",
    standardPassword: process.env.CYPRESS_STANDARD_PASSWORD || "",
  },
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    testIsolation: true,
  },
});
