import dayjs from "dayjs";

type FinanceFlowSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
  workerId: string;
  workerName: string;
  serviceId: string;
  serviceName: string;
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

type FinanceEntryApiMock = {
  id: string;
  amount_cents: number;
  occurred_at: string;
  description: string;
  type_id: string;
  type_direction: "income" | "expense";
  source: "work-order" | "manual";
  work_order_id?: string | null;
  related_entry_id?: string | null;
};

function createSeed(): FinanceFlowSeed {
  const unique = Date.now();
  return {
    email: `cypress.finance+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress Finance ${unique}`,
    workspaceId: "ws-cypress-finance-001",
    workspaceName: "Cypress Finance Workspace",
    workerId: "worker-finance-001",
    workerName: "Alex Worker",
    serviceId: "service-finance-001",
    serviceName: "Premium Service",
    workOrderTitle: `WO Finance ${unique}`,
  };
}

function toNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

function buildOverview(workOrders: WorkOrderMock[]): Record<string, unknown> {
  const overdueCount = workOrders.filter((order) => {
    if (!order.dueAt) return false;
    return new Date(order.dueAt).getTime() < Date.now();
  }).length;

  const terminalCount = workOrders.filter((order) => order.status.isTerminal).length;
  const activeCount = workOrders.length - terminalCount;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      total: workOrders.length,
      active: activeCount,
      terminal: terminalCount,
      overdue: overdueCount,
      dueSoon: 0,
      highPriorityOpen: 0,
      unscheduled: 0,
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
    assignmentRole: (String(worker.assignmentRole ?? "executor") as
      | "executor"
      | "assistant"
      | "reviewer"),
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

function isTerminalStatus(status?: WorkOrderStatusMock): boolean {
  if (!status) return false;
  if (status.isTerminal) return true;
  const code = status.code.toLowerCase();
  return (
    code.includes("complete") ||
    code.includes("done") ||
    code.includes("finish") ||
    code.includes("close")
  );
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

function mockWorkOrderFinanceFlowApis(seed: FinanceFlowSeed): void {
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
      description: "E2E workspace for work-order -> finance flow",
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
      description: "Service used for finance automation",
      duration_minutes: 60,
      price_cents: 25000,
      capacity: 1,
      is_active: true,
      created_at: nowIso,
    },
  ];

  const workOrders: WorkOrderMock[] = [];
  const financeEntries: FinanceEntryApiMock[] = [];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-finance-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-finance-firebase-id-token",
        refreshToken: "cypress-finance-firebase-refresh-token",
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
            localId: "uid-cypress-finance-owner",
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
      uid: "uid-cypress-finance-owner",
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
        { uid: "finance", name: "Finance", icon: "dollar-sign" },
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
    body: { data: [] },
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

    expect(body.workspaceId).to.eq(seed.workspaceId);
    expect(body.title).to.be.a("string");
    expect(String(body.title)).to.not.equal("");
    expect(body.workers).to.be.an("array").and.have.length(1);
    expect(body.serviceLines).to.be.an("array").and.have.length(1);

    const created = buildWorkOrderRecord(body, statuses);
    workOrders.unshift(created);

    req.reply({
      statusCode: 201,
      body: { data: created },
    });
  }).as("createWorkOrderRequest");

  cy.intercept("PATCH", /\/work-order\/work-orders\/[^/]+(?:\?.*)?$/, (req) => {
    const body = req.body as Record<string, unknown>;
    const reqUrl = new URL(req.url);
    const id = reqUrl.pathname.split("/").pop() ?? "";
    const current = workOrders.find((order) => order.id === id);

    if (!current) {
      req.reply({ statusCode: 404, body: { message: "Work order not found" } });
      return;
    }

    const nextStatus =
      typeof body.statusId === "string"
        ? statuses.find((status) => status.id === body.statusId) ?? current.status
        : current.status;

    const updated: WorkOrderMock = {
      ...current,
      ...body,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: typeof body.updatedBy === "string" ? body.updatedBy : current.updatedBy,
      workers: Array.isArray(body.workers)
        ? (body.workers as WorkOrderMock["workers"])
        : current.workers,
      serviceLines: Array.isArray(body.serviceLines)
        ? (body.serviceLines as WorkOrderMock["serviceLines"]).map((line, index) => ({
            id: `service-line-${id}-${index}`,
            serviceId: String(line.serviceId ?? ""),
            quantity: Math.max(1, toNumber(line.quantity, 1)),
            unitPriceCents: Math.max(0, toNumber(line.unitPriceCents, 0)),
            totalPriceCents:
              Math.max(1, toNumber(line.quantity, 1)) *
              Math.max(0, toNumber(line.unitPriceCents, 0)),
            notes: line.notes ?? null,
          }))
        : current.serviceLines,
      inventoryLines: Array.isArray(body.inventoryLines)
        ? (body.inventoryLines as WorkOrderMock["inventoryLines"]).map((line, index) => ({
            id: `inventory-line-${id}-${index}`,
            inventoryItemId: String(line.inventoryItemId ?? ""),
            direction: (String(line.direction ?? "output") as "input" | "output"),
            plannedQuantity: Math.max(0, toNumber(line.plannedQuantity, 0)),
            consumedQuantity: Math.max(0, toNumber(line.consumedQuantity, 0)),
            unitCostCents: Math.max(0, toNumber(line.unitCostCents, 0)),
            totalCostCents:
              Math.max(0, toNumber(line.consumedQuantity, 0)) *
              Math.max(0, toNumber(line.unitCostCents, 0)),
          }))
        : current.inventoryLines,
      estimatedDurationMinutes:
        body.estimatedDurationMinutes !== undefined
          ? toNumber(body.estimatedDurationMinutes, 0)
          : current.estimatedDurationMinutes,
      actualDurationMinutes:
        body.actualDurationMinutes !== undefined
          ? toNumber(body.actualDurationMinutes, 0)
          : current.actualDurationMinutes,
      completedAt:
        typeof body.completedAt === "string"
          ? body.completedAt
          : isTerminalStatus(nextStatus)
            ? current.completedAt ?? new Date().toISOString()
            : current.completedAt,
    };

    const index = workOrders.findIndex((order) => order.id === id);
    if (index >= 0) workOrders[index] = updated;

    if (isTerminalStatus(updated.status)) {
      const existing = financeEntries.find(
        (entry) => entry.source === "work-order" && entry.work_order_id === updated.id
      );
      if (!existing) {
        const amountCents = Math.max(1, Number(updated.totalEstimatedCents ?? 0));
        financeEntries.unshift({
          id: `fin-${updated.id}`,
          amount_cents: amountCents,
          occurred_at: updated.completedAt ?? new Date().toISOString(),
          description: `Work order completed: ${updated.title}`,
          type_id: "income",
          type_direction: "income",
          source: "work-order",
          work_order_id: updated.id,
          related_entry_id: updated.id,
        });
      }
    }

    req.reply({
      statusCode: 200,
      body: { data: updated },
    });
  }).as("updateWorkOrderRequest");

  cy.intercept("GET", /\/finance\/internal\/entry-types(?:\?.*)?$/, {
    statusCode: 200,
    body: [
      { id: "income", key: "income", name: "Income", direction: "income" },
      { id: "expense", key: "expense", name: "Expense", direction: "expense" },
      { id: "fixed", key: "fixed", name: "Fixed", direction: "expense" },
    ],
  }).as("listFinanceEntryTypesRequest");

  cy.intercept("GET", /\/finance\/entries(?:\?.*)?$/, (req) => {
    const accept = String(req.headers.accept ?? "");
    if (accept.includes("text/html")) {
      req.continue();
      return;
    }

    req.alias = "listFinanceEntriesApiRequest";
    req.reply({
      statusCode: 200,
      body: financeEntries,
    });
  });

  cy.intercept("GET", /\/finance\/dashboard(?:\?.*)?$/, () => {
    const totalIncomeCents = financeEntries
      .filter((entry) => entry.type_direction === "income")
      .reduce((sum, entry) => sum + entry.amount_cents, 0);
    const totalExpenseCents = financeEntries
      .filter((entry) => entry.type_direction === "expense")
      .reduce((sum, entry) => sum + entry.amount_cents, 0);
    const profitCents = totalIncomeCents - totalExpenseCents;
    const marginPct =
      totalIncomeCents > 0 ? Number((profitCents / totalIncomeCents).toFixed(4)) : 0;

    return {
      statusCode: 200,
      body: {
        period: {
          start: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
          end: dayjs().format("YYYY-MM-DD"),
          bucket: "day",
          label: "Last 30 days",
        },
        kpis: {
          revenue_cents: totalIncomeCents,
          expense_cents: totalExpenseCents,
          profit_cents: profitCents,
          margin_pct: marginPct,
        },
        variation: {
          revenue_pct: 0,
          expense_pct: 0,
          profit_pct: 0,
          margin_pct_points: 0,
        },
        trend: [],
        cashflow: financeEntries.map((entry) => ({
          id: entry.id,
          occurred_at: entry.occurred_at,
          description: entry.description,
          amount_cents: entry.amount_cents,
          type_id: entry.type_id,
          type_name: entry.type_id,
          type_direction: entry.type_direction,
          source: entry.source,
          work_order_id: entry.work_order_id ?? null,
          related_entry_id: entry.related_entry_id ?? null,
        })),
        top_services: [],
      },
    };
  }).as("financeDashboardRequest");
}

describe("Finance module - work order automation integration", () => {
  it("completes a work order and validates an income entry in finance entries", () => {
    const seed = createSeed();
    mockWorkOrderFinanceFlowApis(seed);

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

    cy.getBySel("work-order-form").should("be.visible");
    cy.getBySel("work-order-title-input").type(seed.workOrderTitle);
    cy.getBySel("work-order-description-input").type(
      "Work order generated by Cypress E2E for finance automation."
    );
    selectAntdOption("work-order-priority-select", "High");

    cy.contains('[role="tab"]', "Team").click({ force: true });
    cy.getBySel("work-order-add-worker-button").click({ force: true });
    selectAntdOption("work-order-worker-select-0", seed.workerName);
    selectAntdOption("work-order-worker-role-select-0", "Executor");
    typeIntoControlInput("work-order-worker-minutes-input-0", "90");

    cy.contains('[role="tab"]', "Lines").click({ force: true });
    cy.getBySel("work-order-add-service-line-button").click({ force: true });
    selectAntdOption("work-order-service-select-0", seed.serviceName);
    typeIntoControlInput("work-order-service-qty-input-0", "1");
    typeIntoControlInput("work-order-service-unit-price-input-0", "25000");
    typeIntoControlInput("work-order-service-notes-input-0", "Finance automation line");

    cy.getBySel("work-order-submit-button").click({ force: true });
    cy.wait("@createWorkOrderRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      const requestBody = interception.request.body as {
        title: string;
        workers: Array<{ userUid: string }>;
        serviceLines: Array<{ serviceId: string; unitPriceCents: number }>;
      };
      expect(requestBody.title).to.eq(seed.workOrderTitle);
      expect(requestBody.workers[0]?.userUid).to.eq(seed.workerId);
      expect(requestBody.serviceLines[0]?.serviceId).to.eq(seed.serviceId);
      expect(requestBody.serviceLines[0]?.unitPriceCents).to.eq(25000);
    });
    cy.wait("@listWorkOrdersRequest", { timeout: 30000 });
    cy.contains("Work order created", { timeout: 30000 }).should("be.visible");

    cy.getBySel("work-order-submit-button").should("contain.text", "Save changes");
    cy.contains('[role="tab"]', "General").click({ force: true });
    selectAntdOption("work-order-status-select", "Completed");
    cy.getBySel("work-order-submit-button").click({ force: true });

    cy.wait("@updateWorkOrderRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const requestBody = interception.request.body as {
        statusId?: string;
        updatedBy?: string;
      };
      expect(requestBody.statusId).to.eq("status-completed");
      expect(requestBody.updatedBy).to.eq("uid-cypress-finance-owner");
    });
    cy.wait("@listWorkOrdersRequest", { timeout: 30000 });
    cy.contains("Work order updated", { timeout: 30000 }).should("be.visible");

    cy.visit("/finance/entries");
    cy.getBySel("finance-entries-header").should("be.visible");
    cy.getBySel("finance-entries-title").should("contain.text", "Entries");
    cy.wait("@financeDashboardRequest", { timeout: 30000 });
    cy.wait("@listFinanceEntriesApiRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const responseBody = interception.response?.body as FinanceEntryApiMock[];
      expect(responseBody).to.have.length.greaterThan(0);
      expect(responseBody[0]?.type_direction).to.eq("income");
      expect(responseBody[0]?.source).to.eq("work-order");
      expect(responseBody[0]?.description).to.contain(seed.workOrderTitle);
    });

    cy.contains('[data-cy="finance-entries-list"]', `Work order completed: ${seed.workOrderTitle}`).should(
      "be.visible"
    );
    cy.contains('[data-cy="finance-entries-list"]', "250").should("be.visible");
  });
});

export {};
