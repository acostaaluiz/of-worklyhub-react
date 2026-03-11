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
  },
  e2e: {
    baseUrl,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    testIsolation: true,
  },
});
