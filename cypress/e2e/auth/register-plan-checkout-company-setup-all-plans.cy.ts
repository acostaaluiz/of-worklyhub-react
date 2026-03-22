type PlanId = "starter" | "standard" | "premium";

type PlanCase = {
  id: PlanId;
  dbId: number;
  name: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
};

type E2eUserSeed = {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  legalName: string;
  primaryService: string;
  launchServiceName: string;
};

const PLAN_CASES: PlanCase[] = [
  {
    id: "starter",
    dbId: 1,
    name: "Starter",
    monthlyPriceCents: 2900,
    yearlyPriceCents: 29900,
  },
  {
    id: "standard",
    dbId: 2,
    name: "Standard",
    monthlyPriceCents: 5900,
    yearlyPriceCents: 59900,
  },
  {
    id: "premium",
    dbId: 3,
    name: "Premium",
    monthlyPriceCents: 9900,
    yearlyPriceCents: 99900,
  },
];

const PLAN_MODULES: Record<PlanId, string[]> = {
  starter: ["billing", "clients", "company", "dashboard", "schedule", "services"],
  standard: [
    "billing",
    "clients",
    "company",
    "dashboard",
    "schedule",
    "services",
    "finance",
    "inventory",
    "people",
    "work-order",
  ],
  premium: [
    "billing",
    "clients",
    "company",
    "dashboard",
    "schedule",
    "services",
    "finance",
    "inventory",
    "people",
    "work-order",
    "growth",
    "sla",
  ],
};

function createSeed(planId: PlanId): E2eUserSeed {
  const unique = `${Date.now()}-${planId}-${Cypress._.random(1000, 9999)}`;
  return {
    fullName: `Cypress ${planId} ${unique}`,
    email: `cypress+${planId}+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    companyName: `Company ${planId} ${unique}`,
    legalName: `Legal ${planId} ${unique}`,
    primaryService: "Preventive maintenance",
    launchServiceName: "Initial service package",
  };
}

function buildPlansResponse() {
  return PLAN_CASES.map((plan) => ({
    id: plan.id,
    dbId: plan.dbId,
    name: plan.name,
    description: `${plan.name} plan`,
    currency: "USD",
    priceCents: {
      monthly: plan.monthlyPriceCents,
      yearly: plan.yearlyPriceCents,
    },
    features: [],
    recommended: plan.id === "starter",
  }));
}

function buildOverviewModules(planId: PlanId | null): Array<{
  uid: string;
  name: string;
  icon: string;
}> {
  if (!planId) return [];
  return PLAN_MODULES[planId].map((moduleUid) => ({
    uid: moduleUid,
    name: moduleUid,
    icon: "briefcase",
  }));
}

function mockOnboardingNetwork(seed: E2eUserSeed, expectedPlan: PlanCase): void {
  let workspace: Record<string, unknown> | null = null;
  let activePlanId: PlanId | null = null;

  cy.intercept("POST", "**/internal/auth/register", (req) => {
    req.reply({
      statusCode: 201,
      body: {
        uid: "uid-cypress-owner",
        email: seed.email,
      },
    });
  }).as("registerRequest");

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    (req) => {
      req.reply({
        statusCode: 200,
        body: {
          kind: "identitytoolkit#VerifyPasswordResponse",
          localId: "uid-cypress-owner",
          email: seed.email,
          displayName: seed.fullName,
          idToken: "cypress-firebase-id-token",
          refreshToken: "cypress-firebase-refresh-token",
          expiresIn: "3600",
          registered: true,
        },
      });
    }
  ).as("firebaseSignInRequest");

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:lookup.*/,
    {
      statusCode: 200,
      body: {
        users: [
          {
            localId: "uid-cypress-owner",
            email: seed.email,
            displayName: seed.fullName,
            emailVerified: true,
          },
        ],
      },
    }
  ).as("firebaseLookupRequest");

  cy.intercept("POST", "**/internal/auth/verify-token", (req) => {
    expect(String(req.headers.authorization ?? "")).to.include("Bearer ");
    req.reply({
      statusCode: 200,
      body: {
        uid: "uid-cypress-owner",
        claims: {
          role: "owner",
          email: seed.email,
        },
      },
    });
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: {
        name: seed.fullName,
        email: seed.email,
        planId: activePlanId ? PLAN_CASES.find((item) => item.id === activePlanId)?.dbId : undefined,
        planStatus: activePlanId ? "ACTIVE-PLAN" : "INACTIVE-PLAN",
        planTitle: activePlanId ? PLAN_CASES.find((item) => item.id === activePlanId)?.name : undefined,
      },
    });
  }).as("userProfileRequest");

  cy.intercept("GET", "**/internal/application/categories", {
    statusCode: 200,
    body: {
      categories: [
        { uid: "maintenance", name: "Maintenance" },
        { uid: "beauty", name: "Beauty" },
      ],
    },
  }).as("categoriesRequest");

  cy.intercept("GET", "**/internal/application/industries", {
    statusCode: 200,
    body: {
      industries: [
        { uid: "services", name: "Services" },
        { uid: "retail", name: "Retail" },
      ],
    },
  }).as("industriesRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: { workspace },
    });
  }).as("workspaceRequest");

  cy.intercept("POST", /\/company\/internal\/workspaces$/, (req) => {
    workspace = {
      id: `ws-${expectedPlan.id}-001`,
      workspaceId: `ws-${expectedPlan.id}-001`,
      name: seed.companyName,
      fullName: seed.fullName,
      email: seed.email,
      accountType: "company",
      tradeName: seed.companyName,
      legalName: seed.legalName,
      industry: "services",
      primaryService: seed.primaryService,
      description: "Cypress onboarding run",
      company_profile: {
        trade_name: seed.companyName,
        legal_name: seed.legalName,
        industry: "services",
        primary_service: seed.primaryService,
        description: "Cypress onboarding run",
      },
    };

    req.reply({
      statusCode: 201,
      body: workspace,
    });
  }).as("createWorkspaceRequest");

  cy.intercept("GET", "**/me/overview", (req) => {
    const currentPlan = activePlanId
      ? PLAN_CASES.find((item) => item.id === activePlanId)
      : null;
    req.reply({
      statusCode: 200,
      body: {
        profile: {
          name: seed.fullName,
          email: seed.email,
          planId: currentPlan?.dbId,
          planStatus: currentPlan ? "ACTIVE-PLAN" : "INACTIVE-PLAN",
          planTitle: currentPlan?.name,
        },
        modules: buildOverviewModules(activePlanId),
      },
    });
  }).as("overviewRequest");

  cy.intercept("GET", "**/billing/plans", {
    statusCode: 200,
    body: {
      data: {
        plans: buildPlansResponse(),
        payment: {
          gateway: "mercadopago",
          configured: true,
          supportedMethods: ["hosted"],
        },
      },
    },
  }).as("billingPlansRequest");

  cy.intercept("POST", "**/billing/checkout", (req) => {
    expect(String(req.headers.authorization ?? "")).to.include("Bearer ");
    expect(String((req.body as { planId?: string }).planId ?? "")).to.eq(expectedPlan.id);

    activePlanId = expectedPlan.id;

    req.reply({
      statusCode: 200,
      body: {
        data: {
          id: `chk-${expectedPlan.id}-001`,
          status: "approved",
          type: "card",
          provider: "mercadopago",
          plan: buildPlansResponse().find((plan) => plan.id === expectedPlan.id),
          billingCycle: "monthly",
          amount: expectedPlan.monthlyPriceCents / 100,
          amount_cents: expectedPlan.monthlyPriceCents,
          currency: "USD",
        },
      },
    });
  }).as("checkoutRequest");
}

function fillRegisterAndLogin(seed: E2eUserSeed): void {
  cy.visit("/register");
  cy.getBySel("register-form").should("be.visible");
  cy.getBySel("register-name-input").type(seed.fullName);
  cy.getBySel("register-email-input").type(seed.email);
  cy.getBySel("register-password-input").type(seed.password, { log: false });
  cy.getBySel("register-confirm-password-input").type(seed.password, { log: false });
  cy.getBySel("register-accept-terms").click({ force: true });
  cy.getBySel("register-submit-button").click();
  cy.wait("@registerRequest", { timeout: 30000 })
    .its("response.statusCode")
    .should("eq", 201);

  cy.getBySel("response-modal", { timeout: 30000 }).should("be.visible");
  cy.getBySel("response-modal-primary-button").click();
  cy.location("pathname", { timeout: 30000 }).should("eq", "/login");

  cy.getBySel("login-form").should("be.visible");
  cy.getBySel("login-email-input").type(seed.email);
  cy.getBySel("login-password-input").type(seed.password, { log: false });
  cy.getBySel("login-submit-button").click();
  cy.wait("@firebaseSignInRequest", { timeout: 30000 });
  cy.wait("@verifyTokenRequest", { timeout: 30000 });
}

function completeCheckout(seed: E2eUserSeed, plan: PlanCase): void {
  cy.location("pathname", { timeout: 45000 }).should("eq", "/billing/plans");
  cy.getBySel("billing-plan-selection-page").should("be.visible");
  cy.getBySel(`billing-plan-select-${plan.id}`).click({ force: true });
  cy.getBySel("confirmation-modal").should("be.visible");
  cy.getBySel("confirmation-modal-confirm-button").click({ force: true });

  cy.location("pathname", { timeout: 45000 }).should("eq", "/billing/checkout");
  cy.getBySel("billing-checkout-page").should("be.visible");
  cy.getBySel("billing-checkout-full-name-input").clear().type(seed.fullName);
  cy.getBySel("billing-checkout-email-input").clear().type(seed.email);
  cy.getBySel("billing-checkout-company-input").clear().type(seed.companyName);
  cy.getBySel("billing-checkout-submit-button").click();
  cy.wait("@checkoutRequest", { timeout: 30000 })
    .its("response.statusCode")
    .should("eq", 200);
  cy.wait("@overviewRequest", { timeout: 30000 });
}

function completeCompanySetup(seed: E2eUserSeed): void {
  cy.location("pathname", { timeout: 45000 }).should("eq", "/company/introduction");
  cy.getBySel("company-setup-wizard").should("be.visible");
  cy.wait("@categoriesRequest", { timeout: 30000 });
  cy.wait("@industriesRequest", { timeout: 30000 });

  cy.getBySel("wizard-step-owner").should("be.visible");
  cy.getBySel("company-setup-full-name-input").clear().type(seed.fullName);
  cy.getBySel("company-setup-email-input").clear().type(seed.email);
  cy.getBySel("company-setup-phone-input").type("11999999999");
  cy.getBySel("wizard-next-button").click({ force: true });

  cy.getBySel("wizard-step-company").should("be.visible");
  cy.getBySel("company-setup-account-type-company").click({ force: true });
  cy.getBySel("company-setup-company-name-input").type(seed.companyName);
  cy.getBySel("company-setup-legal-name-input").type(seed.legalName);
  cy.getBySel("company-setup-employees-input").then(($element) => {
    const input = $element.is("input") ? $element : $element.find("input");
    cy.wrap(input).type("10");
  });
  cy.getBySel("wizard-next-button").click({ force: true });

  cy.getBySel("wizard-step-market").should("be.visible");
  cy.getBySel("company-setup-primary-service-input").type(seed.primaryService);
  cy.getBySel("company-setup-primary-service-category-select").click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", "Maintenance").click({
    force: true,
  });
  cy.getBySel("company-setup-industry-select").click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", "Services").click({
    force: true,
  });
  cy.getBySel("company-setup-description-input").type("Cypress onboarding run");
  cy.getBySel("wizard-next-button").click({ force: true });

  cy.getBySel("wizard-step-launch-services").should("be.visible");
  cy.getBySel("launch-service-name-input-0").type(seed.launchServiceName);
  cy.getBySel("wizard-next-button").click({ force: true });

  cy.getBySel("wizard-step-summary").should("be.visible");
  cy.getBySel("wizard-finish-button").click({ force: true });
  cy.wait("@createWorkspaceRequest", { timeout: 30000 })
    .its("response.statusCode")
    .should("eq", 201);

  cy.getBySel("response-modal", { timeout: 30000 }).should("be.visible");
  cy.getBySel("response-modal-primary-button").click();
  cy.location("pathname", { timeout: 45000 }).should("eq", "/billing/plans");
}

describe("Auth + billing checkout + company setup", () => {
  PLAN_CASES.forEach((plan) => {
    it(`completes onboarding end-to-end for ${plan.name}`, () => {
      const seed = createSeed(plan.id);
      mockOnboardingNetwork(seed, plan);

      fillRegisterAndLogin(seed);
      completeCompanySetup(seed);
      completeCheckout(seed, plan);

      cy.location("pathname", { timeout: 45000 }).should("eq", "/home");
      cy.window().then((win) => {
        expect(win.localStorage.getItem("company.workspace")).to.not.equal(null);
      });
    });
  });
});

export {};
