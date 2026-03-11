type BasicRegistrationSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  companyName: string;
  serviceTitle: string;
  categoryName: string;
  productName: string;
  employeeFirstName: string;
  employeeLastName: string;
  statusCode: string;
  statusLabel: string;
};

function createSeed(): BasicRegistrationSeed {
  const unique = Date.now();
  return {
    email: `cypress.basic+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress Basic ${unique}`,
    workspaceId: "ws-cypress-basic-001",
    companyName: "Cypress Basic Workspace",
    serviceTitle: `Service ${unique}`,
    categoryName: `Category ${unique}`,
    productName: `Product ${unique}`,
    employeeFirstName: "Alex",
    employeeLastName: `Tester ${unique}`,
    statusCode: `custom-${String(unique).slice(-5)}`,
    statusLabel: `Custom Status ${unique}`,
  };
}

function mockLoginAndBasicRegistrationApis(seed: BasicRegistrationSeed): void {
  const nowIso = new Date().toISOString();
  const workspace: Record<string, unknown> = {
    id: seed.workspaceId,
    workspaceId: seed.workspaceId,
    name: seed.companyName,
    fullName: seed.fullName,
    email: seed.email,
    accountType: "company",
    tradeName: seed.companyName,
    company_profile: {
      trade_name: seed.companyName,
      description: "E2E workspace for basic registrations",
    },
  };

  const companyServices: Array<Record<string, unknown>> = [];
  const inventoryItems: Array<Record<string, unknown>> = [];
  const peopleWorkers: Array<Record<string, unknown>> = [];
  const workOrderStatuses: Array<Record<string, unknown>> = [
    {
      id: "status-opened",
      code: "opened",
      label: "Opened",
      isTerminal: false,
      sortOrder: 1,
    },
  ];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-basic-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-basic-firebase-id-token",
        refreshToken: "cypress-basic-firebase-refresh-token",
        expiresIn: "3600",
        registered: true,
      },
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
            localId: "uid-cypress-basic-owner",
            email: seed.email,
            displayName: seed.fullName,
            emailVerified: true,
          },
        ],
      },
    }
  ).as("firebaseLookupRequest");

  cy.intercept("POST", "**/internal/auth/verify-token", {
    statusCode: 200,
    body: {
      uid: "uid-cypress-basic-owner",
      claims: { role: "owner" },
    },
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.fullName,
      email: seed.email,
      planId: 1,
      planTitle: "Starter",
    },
  }).as("userProfileRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, {
    statusCode: 200,
    body: { workspace },
  }).as("workspaceRequest");

  cy.intercept("GET", "**/users/internal/users/notifications/summary*", {
    statusCode: 200,
    body: {
      summary: {
        unreadCount: 0,
        highPriorityUnreadCount: 0,
        totalActive: 0,
        lastGeneratedAt: nowIso,
      },
    },
  }).as("notificationsSummaryRequest");

  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        name: seed.fullName,
        email: seed.email,
        planTitle: "Starter",
      },
      modules: [
        { uid: "company", name: "Company", icon: "briefcase" },
        { uid: "inventory", name: "Inventory", icon: "box" },
        { uid: "people", name: "People", icon: "users" },
        { uid: "work-order", name: "Work order", icon: "layout-dashboard" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/company\/internal\/workspaces\/[^/]+\/services(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: companyServices,
    });
  }).as("listCompanyServicesRequest");

  cy.intercept("POST", /\/company\/internal\/workspaces\/[^/]+\/services(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;
    const created = {
      id: `service-${Date.now()}`,
      name: String(body.name ?? ""),
      description: body.description ?? null,
      duration_minutes:
        typeof body.duration_minutes === "number" ? body.duration_minutes : 30,
      price_cents:
        typeof body.price_cents === "number" ? body.price_cents : 0,
      capacity: typeof body.capacity === "number" ? body.capacity : 1,
      is_active: body.is_active !== false,
      created_at: nowIso,
    };
    companyServices.unshift(created);
    req.reply({ statusCode: 201, body: created });
  }).as("createCompanyServiceRequest");

  cy.intercept("GET", /\/inventory\/internal\/items(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: { data: inventoryItems },
    });
  }).as("listInventoryItemsRequest");

  cy.intercept("POST", /\/inventory\/internal\/items(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;
    const created = {
      id: `item-${Date.now()}`,
      workspaceId: String(body.workspaceId ?? seed.workspaceId),
      name: String(body.name ?? ""),
      sku: (body.sku ?? null) as string | null,
      category: (body.category ?? null) as string | null,
      quantity:
        typeof body.quantity === "number" ? body.quantity : 0,
      minQuantity:
        typeof body.minQuantity === "number" ? body.minQuantity : 0,
      location: (body.location ?? null) as string | null,
      priceCents:
        typeof body.priceCents === "number" ? body.priceCents : 0,
      isActive: body.isActive !== false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    inventoryItems.unshift(created);
    req.reply({ statusCode: 201, body: { data: created } });
  }).as("createInventoryItemRequest");

  cy.intercept("GET", /\/inventory\/internal\/movements(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: [] },
  }).as("listInventoryMovementsRequest");

  cy.intercept("GET", /\/inventory\/internal\/alerts(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      generatedAt: nowIso,
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      alerts: [],
      suggestions: [],
    },
  }).as("inventoryAlertsRequest");

  cy.intercept("GET", /\/people\/internal\/workspaces\/[^/]+\/workers(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: peopleWorkers,
    });
  }).as("listPeopleWorkersRequest");

  cy.intercept("POST", /\/people\/workers(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;
    const fullName = String(body.user_name ?? "").trim();
    const [firstName, ...rest] = fullName.split(" ").filter(Boolean);
    const created = {
      id: `worker-${Date.now()}`,
      user_uid: `uid-worker-${Date.now()}`,
      first_name: firstName || seed.employeeFirstName,
      last_name: rest.join(" "),
      email: String(body.user_email ?? ""),
      job_title: String(body.job_title ?? ""),
      department: String(body.department ?? ""),
      active: true,
      created_at: nowIso,
    };
    peopleWorkers.unshift(created);
    req.reply({ statusCode: 201, body: created });
  }).as("createPeopleWorkerRequest");

  cy.intercept("GET", /\/api\/v1\/work-order\/statuses(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: { data: workOrderStatuses },
    });
  }).as("listWorkOrderStatusesRequest");

  cy.intercept("POST", /\/api\/v1\/work-order\/statuses(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;
    const created = {
      id: `status-${Date.now()}`,
      code: String(body.code ?? ""),
      label: String(body.label ?? ""),
      isTerminal: Boolean(body.isTerminal),
      sortOrder:
        typeof body.sortOrder === "number" ? body.sortOrder : 10,
    };
    workOrderStatuses.push(created);
    req.reply({ statusCode: 201, body: { data: created } });
  }).as("createWorkOrderStatusRequest");
}

function typeIntoInputField(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const input = $element.is("input") ? $element : $element.find("input");
    if (input.length > 0) {
      cy.wrap(input).click({ force: true }).clear({ force: true }).type(value, {
        force: true,
      });
      return;
    }
    cy.wrap($element).click({ force: true }).type(value, { force: true });
  });
}

describe("Login + basic registrations", () => {
  it("logs in and creates core registrations in services, inventory, people and work orders", () => {
    const seed = createSeed();
    mockLoginAndBasicRegistrationApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/company/services");
    cy.getBySel("company-services-page").should("be.visible");
    cy.wait("@listCompanyServicesRequest", { timeout: 30000 });
    cy.getBySel("company-services-new-button").click({ force: true });
    cy.getBySel("company-services-form-modal").should("be.visible");
    cy.getBySel("company-services-title-input").type(seed.serviceTitle);
    cy.getBySel("company-services-description-input").type(
      "Service created by Cypress basic registration flow"
    );
    cy.getBySel("company-services-save-button").click({ force: true });
    cy.wait("@createCompanyServiceRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.wait("@listCompanyServicesRequest", { timeout: 30000 });
    cy.contains(seed.serviceTitle, { timeout: 30000 }).should("be.visible");

    cy.visit("/inventory/categories");
    cy.getBySel("inventory-categories-page").should("be.visible");
    cy.getBySel("inventory-category-name-input").type(seed.categoryName);
    cy.getBySel("inventory-category-description-input").type(
      "Category created by Cypress"
    );
    cy.getBySel("inventory-category-save-button").click();
    cy.contains(seed.categoryName, { timeout: 30000 }).should("be.visible");

    cy.visit("/inventory/home");
    cy.getBySel("inventory-home-page").should("be.visible");
    cy.wait("@listInventoryItemsRequest", { timeout: 30000 });
    cy.getBySel("inventory-new-product-button").click({ force: true });
    cy.getBySel("inventory-product-modal").should("be.visible");
    cy.getBySel("inventory-product-name-input").type(seed.productName);
    cy.getBySel("inventory-product-sku-input").type(`SKU-${Date.now()}`);
    typeIntoInputField("inventory-product-stock-input", "20");
    typeIntoInputField("inventory-product-price-input", "199.90");
    cy.getBySel("inventory-product-save-button").click({ force: true });
    cy.wait("@createInventoryItemRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.wait("@listInventoryItemsRequest", { timeout: 30000 });
    cy.contains(seed.productName, { timeout: 30000 }).should("be.visible");

    cy.visit("/people");
    cy.getBySel("people-home-tabs").should("be.visible");
    cy.wait("@listPeopleWorkersRequest", { timeout: 30000 });
    cy.getBySel("people-new-employee-button").click({ force: true });
    cy.getBySel("people-employee-modal").should("be.visible");
    cy.getBySel("people-employee-first-name-input").type(seed.employeeFirstName);
    cy.getBySel("people-employee-last-name-input").type(seed.employeeLastName);
    cy.getBySel("people-employee-email-input").type(`employee.${Date.now()}@worklyhub.dev`);
    cy.getBySel("people-employee-role-input").type("Technician");
    cy.getBySel("people-employee-department-input").type("Operations");
    cy.getBySel("people-employee-save-button").click({ force: true });
    cy.wait("@createPeopleWorkerRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.contains(`${seed.employeeFirstName} ${seed.employeeLastName}`, {
      timeout: 30000,
    }).should("be.visible");

    cy.visit("/work-order/statuses");
    cy.getBySel("work-order-statuses-page").should("be.visible");
    cy.wait("@listWorkOrderStatusesRequest", { timeout: 30000 });
    typeIntoInputField("work-order-status-code-input", seed.statusCode);
    typeIntoInputField("work-order-status-label-input", seed.statusLabel);
    typeIntoInputField("work-order-status-order-input", "25");
    cy.getBySel("work-order-status-save-button").click({ force: true });
    cy.wait("@createWorkOrderStatusRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.wait("@listWorkOrderStatusesRequest", { timeout: 30000 });
    cy.contains(seed.statusLabel, { timeout: 30000 }).should("be.visible");
  });
});

export {};
