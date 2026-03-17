import dayjs from "dayjs";

type WorkOrderSlaSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
  workerId: string;
  workerName: string;
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

type SlaApiItemMock = {
  id: string;
  workspace_id: string;
  user_uid: string;
  event_id: string;
  work_date: string;
  duration_minutes: number;
  created_at: string;
};

function createSeed(): WorkOrderSlaSeed {
  const unique = Date.now();
  return {
    email: `cypress.sla+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress SLA ${unique}`,
    workspaceId: "ws-cypress-sla-001",
    workspaceName: "Cypress SLA Workspace",
    workerId: "worker-sla-001",
    workerName: "Alex Worker",
    workOrderTitle: `WO SLA ${unique}`,
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

function mockWorkOrderSlaFlowApis(seed: WorkOrderSlaSeed): void {
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
      description: "E2E workspace for work-order + SLA flow",
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

  const workOrders: WorkOrderMock[] = [];
  const slasState: SlaApiItemMock[] = [];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-sla-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-sla-firebase-id-token",
        refreshToken: "cypress-sla-firebase-refresh-token",
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
            localId: "uid-cypress-sla-owner",
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
      uid: "uid-cypress-sla-owner",
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
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/people\/internal\/workspaces\/[^/]+\/workers(?:\?.*)?$/, {
    statusCode: 200,
    body: workers,
  }).as("listPeopleWorkersRequest");

  cy.intercept("GET", /\/company\/internal\/workspaces\/[^/]+\/services(?:\?.*)?$/, {
    statusCode: 200,
    body: [],
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
      const workDate = dayjs(updated.completedAt ?? new Date().toISOString()).format(
        "YYYY-MM-DD"
      );
      (updated.workers ?? []).forEach((worker, workerIndex) => {
        const durationMinutes = Math.max(
          1,
          Number(
            worker.allocatedMinutes ??
              updated.actualDurationMinutes ??
              updated.estimatedDurationMinutes ??
              60
          )
        );
        const existing = slasState.find(
          (item) =>
            item.workspace_id === updated.workspaceId &&
            item.event_id === updated.id &&
            item.user_uid === worker.userUid &&
            item.work_date === workDate
        );

        if (existing) {
          existing.duration_minutes = durationMinutes;
          return;
        }

        slasState.push({
          id: `sla-${updated.id}-${workerIndex + 1}`,
          workspace_id: updated.workspaceId,
          user_uid: worker.userUid,
          event_id: updated.id,
          work_date: workDate,
          duration_minutes: durationMinutes,
          created_at: new Date().toISOString(),
        });
      });
    }

    req.reply({
      statusCode: 200,
      body: { data: updated },
    });
  }).as("updateWorkOrderRequest");

  cy.intercept("GET", /\/company\/internal\/workspaces\/[^/]+\/slas(?:\?.*)?$/, (req) => {
    const userUid = String(req.query.userUid ?? "");
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");
    const eventId = String(req.query.eventId ?? "");

    let result = [...slasState];
    if (userUid) result = result.filter((row) => row.user_uid === userUid);
    if (eventId) result = result.filter((row) => row.event_id === eventId);
    if (from) result = result.filter((row) => row.work_date >= from);
    if (to) result = result.filter((row) => row.work_date <= to);

    req.reply({
      statusCode: 200,
      body: { slas: result },
    });
  }).as("listSlasRequest");
}

describe("SLA module - work order completion integration", () => {
  it("creates and completes a work order, then validates SLA entry for assigned worker", () => {
    const seed = createSeed();
    mockWorkOrderSlaFlowApis(seed);

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

    cy.getBySel("work-order-new-button").click({ force: true });
    cy.getBySel("work-order-form").should("be.visible");
    cy.getBySel("work-order-title-input").type(seed.workOrderTitle);
    cy.getBySel("work-order-description-input").type(
      "Work order generated by Cypress E2E for SLA integration."
    );
    selectAntdOption("work-order-priority-select", "High");

    cy.contains('[role="tab"]', "Schedule").click({ force: true });
    typeIntoControlInput("work-order-estimated-duration-input", "90");

    cy.contains('[role="tab"]', "Team").click({ force: true });
    cy.getBySel("work-order-add-worker-button").click({ force: true });
    selectAntdOption("work-order-worker-select-0", seed.workerName);
    selectAntdOption("work-order-worker-role-select-0", "Executor");
    typeIntoControlInput("work-order-worker-minutes-input-0", "90");

    cy.getBySel("work-order-submit-button").click({ force: true });
    cy.wait("@createWorkOrderRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      const requestBody = interception.request.body as {
        title: string;
        workers: Array<{ userUid: string; allocatedMinutes: number }>;
      };
      expect(requestBody.title).to.eq(seed.workOrderTitle);
      expect(requestBody.workers[0]?.userUid).to.eq(seed.workerId);
      expect(requestBody.workers[0]?.allocatedMinutes).to.eq(90);
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
      expect(requestBody.updatedBy).to.eq("uid-cypress-sla-owner");
    });
    cy.wait("@listWorkOrdersRequest", { timeout: 30000 });
    cy.contains("Work order updated", { timeout: 30000 }).should("be.visible");

    cy.visit("/company/slas");
    cy.getBySel("sla-page").should("be.visible");
    cy.getBySel("sla-page-title").should("contain.text", "Employee SLA");
    cy.wait("@listSlasRequest", { timeout: 30000 });

    cy.getBySel("sla-table-wrapper").should("be.visible");
    cy.getBySel("sla-day-entries").should("contain.text", "1 day entries");
    cy.getBySel("sla-total-hours").should("contain.text", "1.50 h");
    cy.contains('[data-cy="sla-table-wrapper"]', seed.workerName).should("be.visible");

    selectAntdOption("sla-employee-select", seed.workerName);
    cy.getBySel("sla-employee-select").should("contain.text", seed.workerName);
    cy.getBySel("sla-apply-filters-button").click({ force: true });
    cy.wait("@listSlasRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const responseBody = interception.response?.body as {
        slas?: Array<{ user_uid?: string }>;
      };
      expect(responseBody.slas?.[0]?.user_uid).to.eq(seed.workerId);
    });
    cy.getBySel("sla-day-entries").should("contain.text", "1 day entries");
    cy.contains('[data-cy="sla-table-wrapper"]', seed.workerName).should("be.visible");
  });
});

export {};
