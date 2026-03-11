type WorkOrderFlowSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
  workerId: string;
  workerName: string;
  serviceId: string;
  serviceName: string;
  inventoryItemId: string;
  inventoryItemName: string;
  workOrderTitle: string;
};

type WorkOrderStatusMock = {
  id: string;
  code: string;
  label: string;
  isTerminal: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type WorkOrderMock = {
  id: string;
  workspaceId: string;
  status: WorkOrderStatusMock;
  title: string;
  description?: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  requesterUserUid?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  dueAt?: string | null;
  estimatedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;
  completedAt?: string | null;
  serviceTotalCents: number;
  inventoryTotalCents: number;
  totalEstimatedCents: number;
  metadata: Record<string, unknown>;
  serviceLines: Array<{
    id: string;
    serviceId: string;
    quantity: number;
    unitPriceCents: number;
    totalPriceCents: number;
    notes?: string | null;
  }>;
  workers: Array<{
    workspaceId: string;
    userUid: string;
    assignmentRole: "executor" | "assistant" | "reviewer";
    allocatedMinutes: number;
  }>;
  inventoryLines: Array<{
    id: string;
    inventoryItemId: string;
    direction: "input" | "output";
    plannedQuantity: number;
    consumedQuantity: number;
    unitCostCents: number;
    totalCostCents: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

function createSeed(): WorkOrderFlowSeed {
  const unique = Date.now();
  return {
    email: `cypress.workorder+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress WorkOrder ${unique}`,
    workspaceId: "ws-cypress-work-order-001",
    workspaceName: "Cypress Work Order Workspace",
    workerId: "worker-001",
    workerName: "Alex Worker",
    serviceId: "service-haircut",
    serviceName: "Haircut Premium",
    inventoryItemId: "inventory-shampoo",
    inventoryItemName: "Shampoo Pro",
    workOrderTitle: `WO Cypress ${unique}`,
  };
}

function buildOverview(workOrders: WorkOrderMock[]): Record<string, unknown> {
  const overdueCount = workOrders.filter((order) => {
    if (!order.dueAt) return false;
    return new Date(order.dueAt).getTime() < Date.now();
  }).length;

  const terminalCount = workOrders.filter((order) => order.status.isTerminal).length;
  const activeCount = workOrders.length - terminalCount;
  const highPriorityOpen = workOrders.filter(
    (order) => !order.status.isTerminal && order.priority === "high"
  ).length;
  const unscheduled = workOrders.filter(
    (order) => !order.scheduledStartAt && !order.scheduledEndAt
  ).length;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      total: workOrders.length,
      active: activeCount,
      terminal: terminalCount,
      overdue: overdueCount,
      dueSoon: 0,
      highPriorityOpen,
      unscheduled,
      checklistAtRisk: 0,
    },
    performance: {
      completionRate: workOrders.length > 0 ? (terminalCount / workOrders.length) * 100 : 0,
      avgResolutionHours: 0,
    },
    buckets: {
      byStatus: [],
      byPriority: [],
    },
    insights: [],
  };
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function buildWorkOrderRecord(
  body: Record<string, unknown>,
  statuses: WorkOrderStatusMock[]
): WorkOrderMock {
  const nowIso = new Date().toISOString();
  const statusId = String(body.statusId ?? "");
  const selectedStatus = statuses.find((status) => status.id === statusId) ?? statuses[0];
  const serviceLinesInput = Array.isArray(body.serviceLines)
    ? (body.serviceLines as Array<Record<string, unknown>>)
    : [];
  const workersInput = Array.isArray(body.workers)
    ? (body.workers as Array<Record<string, unknown>>)
    : [];
  const inventoryLinesInput = Array.isArray(body.inventoryLines)
    ? (body.inventoryLines as Array<Record<string, unknown>>)
    : [];

  const serviceLines = serviceLinesInput.map((line, index) => {
    const quantity = Math.max(1, toNumber(line.quantity, 1));
    const unitPriceCents = Math.max(0, toNumber(line.unitPriceCents, 0));
    return {
      id: `service-line-${Date.now()}-${index}`,
      serviceId: String(line.serviceId ?? ""),
      quantity,
      unitPriceCents,
      totalPriceCents: quantity * unitPriceCents,
      notes: line.notes ? String(line.notes) : null,
    };
  });

  const workers = workersInput.map((worker) => ({
    workspaceId: String(worker.workspaceId ?? body.workspaceId ?? ""),
    userUid: String(worker.userUid ?? ""),
    assignmentRole: (String(worker.assignmentRole ?? "executor") as "executor" | "assistant" | "reviewer"),
    allocatedMinutes: Math.max(0, toNumber(worker.allocatedMinutes, 0)),
  }));

  const inventoryLines = inventoryLinesInput.map((line, index) => {
    const direction = String(line.direction ?? "output") as "input" | "output";
    const plannedQuantity = Math.max(0, toNumber(line.plannedQuantity, 0));
    const consumedQuantity = Math.max(0, toNumber(line.consumedQuantity, 0));
    const unitCostCents = Math.max(0, toNumber(line.unitCostCents, 0));
    return {
      id: `inventory-line-${Date.now()}-${index}`,
      inventoryItemId: String(line.inventoryItemId ?? ""),
      direction,
      plannedQuantity,
      consumedQuantity,
      unitCostCents,
      totalCostCents: consumedQuantity * unitCostCents,
    };
  });

  const serviceTotalCents = serviceLines.reduce((sum, line) => sum + line.totalPriceCents, 0);
  const inventoryTotalCents = inventoryLines.reduce((sum, line) => sum + line.totalCostCents, 0);
  const totalEstimatedCents = serviceTotalCents + inventoryTotalCents;

  return {
    id: `work-order-${Date.now()}`,
    workspaceId: String(body.workspaceId ?? ""),
    status: selectedStatus,
    title: String(body.title ?? ""),
    description: body.description ? String(body.description) : null,
    priority: (String(body.priority ?? "medium") as "low" | "medium" | "high" | "urgent"),
    requesterUserUid: body.requesterUserUid ? String(body.requesterUserUid) : null,
    createdBy: body.createdBy ? String(body.createdBy) : null,
    updatedBy: null,
    scheduledStartAt: body.scheduledStartAt ? String(body.scheduledStartAt) : null,
    scheduledEndAt: body.scheduledEndAt ? String(body.scheduledEndAt) : null,
    dueAt: body.dueAt ? String(body.dueAt) : null,
    estimatedDurationMinutes:
      body.estimatedDurationMinutes !== undefined
        ? toNumber(body.estimatedDurationMinutes, 0)
        : null,
    actualDurationMinutes: null,
    completedAt: null,
    serviceTotalCents,
    inventoryTotalCents,
    totalEstimatedCents,
    metadata:
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : {},
    serviceLines,
    workers,
    inventoryLines,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function typeIntoControlInput(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const input = $element.is("input") ? $element : $element.find("input");
    cy.wrap(input)
      .should("have.length.greaterThan", 0)
      .first()
      .click({ force: true })
      .type("{selectAll}{backspace}", { force: true })
      .type(value, { force: true });
  });
}

function selectAntdOption(selector: string, optionLabel: string): void {
  cy.getBySel(selector).click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", optionLabel).click({
    force: true,
  });
}

function mockWorkOrderFlowApis(seed: WorkOrderFlowSeed): void {
  const nowIso = new Date().toISOString();
  const workspace = {
    id: seed.workspaceId,
    workspaceId: seed.workspaceId,
    name: seed.workspaceName,
    tradeName: seed.workspaceName,
    fullName: seed.fullName,
    email: seed.email,
    accountType: "company",
    company_profile: {
      trade_name: seed.workspaceName,
      description: "E2E workspace for full work-order flow",
    },
  };

  const statuses: WorkOrderStatusMock[] = [
    {
      id: "status-opened",
      code: "opened",
      label: "Opened",
      isTerminal: false,
      sortOrder: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      id: "status-completed",
      code: "completed",
      label: "Completed",
      isTerminal: true,
      sortOrder: 2,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const workers: Array<Record<string, unknown>> = [
    {
      id: seed.workerId,
      user_uid: seed.workerId,
      first_name: "Alex",
      last_name: "Worker",
      email: "alex.worker@worklyhub.dev",
      job_title: "Technician",
      department: "Operations",
      active: true,
      created_at: nowIso,
    },
  ];

  const services: Array<Record<string, unknown>> = [
    {
      id: seed.serviceId,
      name: seed.serviceName,
      description: "Premium service package",
      duration_minutes: 45,
      price_cents: 18500,
      capacity: 1,
      is_active: true,
      created_at: nowIso,
    },
  ];

  const inventoryItems: Array<Record<string, unknown>> = [
    {
      id: seed.inventoryItemId,
      workspaceId: seed.workspaceId,
      name: seed.inventoryItemName,
      sku: "SKU-CYP-01",
      category: "consumables",
      quantity: 22,
      minQuantity: 5,
      location: "A1",
      priceCents: 4500,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];

  const workOrders: WorkOrderMock[] = [];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-work-order-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-work-order-firebase-id-token",
        refreshToken: "cypress-work-order-firebase-refresh-token",
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
            localId: "uid-cypress-work-order-owner",
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
      uid: "uid-cypress-work-order-owner",
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
        { uid: "work-order", name: "Work order", icon: "layout-dashboard" },
        { uid: "company", name: "Company", icon: "briefcase" },
        { uid: "inventory", name: "Inventory", icon: "box" },
        { uid: "people", name: "People", icon: "users" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/people\/internal\/workspaces\/[^/]+\/workers(?:\?.*)?$/, {
    statusCode: 200,
    body: workers,
  }).as("listPeopleWorkersRequest");

  cy.intercept("GET", /\/company\/internal\/workspaces\/[^/]+\/services(?:\?.*)?$/, {
    statusCode: 200,
    body: services,
  }).as("listCompanyServicesRequest");

  cy.intercept("GET", /\/inventory\/internal\/items(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: inventoryItems },
  }).as("listInventoryItemsRequest");

  cy.intercept("GET", /\/work-order\/statuses(?:\?.*)?$/, {
    statusCode: 200,
    body: { data: statuses },
  }).as("listWorkOrderStatusesRequest");

  cy.intercept("GET", /\/work-order\/work-orders\/overview(?:\?.*)?$/, (req) => {
    req.reply({
      statusCode: 200,
      body: {
        data: buildOverview(workOrders),
      },
    });
  }).as("workOrderOverviewRequest");

  cy.intercept("GET", /\/work-order\/work-orders(?:\?.*)?$/, (req) => {
    const limit = Math.max(1, Number(req.query.limit ?? 24));
    const offset = Math.max(0, Number(req.query.offset ?? 0));
    const pageItems = workOrders.slice(offset, offset + limit);
    const hasMore = offset + limit < workOrders.length;

    req.reply({
      statusCode: 200,
      body: {
        data: pageItems,
        pagination: {
          limit,
          offset,
          total: workOrders.length,
          hasMore,
          nextOffset: hasMore ? offset + limit : null,
        },
      },
    });
  }).as("listWorkOrdersRequest");

  cy.intercept("POST", /\/work-order\/work-orders(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;

    expect(body.title).to.be.a("string");
    expect(String(body.title)).to.not.equal("");
    expect(body.workspaceId).to.eq(seed.workspaceId);
    expect(body.priority).to.eq("high");
    expect(body.estimatedDurationMinutes).to.eq(120);
    expect(body.requesterUserUid).to.eq(seed.workerId);
    expect(body.scheduledStartAt).to.be.a("string");
    expect(body.scheduledEndAt).to.be.a("string");
    expect(body.dueAt).to.be.a("string");
    expect(body.serviceLines).to.be.an("array").and.have.length(1);
    expect(body.workers).to.be.an("array").and.have.length(1);
    expect(body.inventoryLines).to.be.an("array").and.have.length(1);

    const created = buildWorkOrderRecord(body, statuses);
    workOrders.unshift(created);

    req.reply({
      statusCode: 201,
      body: { data: created },
    });
  }).as("createWorkOrderRequest");
}

describe("Work order complete flow", () => {
  it("logs in and opens a complete service order with team, services and inventory lines", () => {
    const seed = createSeed();
    mockWorkOrderFlowApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/work-order");
    cy.getBySel("work-order-page").should("be.visible");
    cy.wait("@listWorkOrderStatusesRequest", { timeout: 30000 });
    cy.wait("@workOrderOverviewRequest", { timeout: 30000 });
    cy.wait("@listWorkOrdersRequest", { timeout: 30000 });
    cy.wait("@listPeopleWorkersRequest", { timeout: 30000 });
    cy.wait("@listCompanyServicesRequest", { timeout: 30000 });
    cy.wait("@listInventoryItemsRequest", { timeout: 30000 });

    cy.getBySel("work-order-form").should("be.visible");
    cy.getBySel("work-order-title-input").type(seed.workOrderTitle);
    cy.getBySel("work-order-description-input").type(
      "Complete work order generated by Cypress E2E"
    );
    selectAntdOption("work-order-priority-select", "High");
    selectAntdOption("work-order-requester-select", seed.workerName);
    cy.getBySel("work-order-metadata-input").type("{selectAll}{backspace}", { force: true });
    cy.getBySel("work-order-metadata-input").type(
      "{\"origin\":\"cypress-e2e\",\"scope\":\"complete\"}",
      { force: true, parseSpecialCharSequences: false }
    );

    cy.contains('[role="tab"]', "Schedule").click({ force: true });
    typeIntoControlInput("work-order-scheduled-start-input", "2026-03-15 09:00{enter}");
    typeIntoControlInput("work-order-scheduled-end-input", "2026-03-15 10:00{enter}");
    typeIntoControlInput("work-order-due-at-input", "2026-03-15 12:00{enter}");
    typeIntoControlInput("work-order-estimated-duration-input", "120");

    cy.contains('[role="tab"]', "Team").click({ force: true });
    cy.getBySel("work-order-add-worker-button").click({ force: true });
    selectAntdOption("work-order-worker-select-0", seed.workerName);
    selectAntdOption("work-order-worker-role-select-0", "Executor");
    typeIntoControlInput("work-order-worker-minutes-input-0", "90");

    cy.contains('[role="tab"]', "Lines").click({ force: true });
    cy.getBySel("work-order-add-service-line-button").click({ force: true });
    selectAntdOption("work-order-service-select-0", seed.serviceName);
    typeIntoControlInput("work-order-service-qty-input-0", "2");
    typeIntoControlInput("work-order-service-unit-price-input-0", "18500");
    typeIntoControlInput("work-order-service-notes-input-0", "Premium execution");

    cy.getBySel("work-order-line-mode-segmented").contains("Inventory").click({ force: true });
    cy.getBySel("work-order-add-inventory-line-button").click({ force: true });
    selectAntdOption("work-order-inventory-item-select-0", seed.inventoryItemName);
    selectAntdOption("work-order-inventory-direction-select-0", "Output");
    typeIntoControlInput("work-order-inventory-planned-input-0", "3");
    typeIntoControlInput("work-order-inventory-consumed-input-0", "2");
    typeIntoControlInput("work-order-inventory-unit-cost-input-0", "4500");

    cy.getBySel("work-order-submit-button").click({ force: true });
    cy.wait("@createWorkOrderRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.wait("@listWorkOrdersRequest", { timeout: 30000 });
    cy.wait("@workOrderOverviewRequest", { timeout: 30000 });

    cy.contains("Work order created", { timeout: 30000 }).should("be.visible");
    cy.contains(seed.workOrderTitle, { timeout: 30000 }).should("be.visible");
    cy.contains("Edit work order", { timeout: 30000 }).should("be.visible");
  });
});

export {};
