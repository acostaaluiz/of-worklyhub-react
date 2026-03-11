import dayjs from "dayjs";

type GrowthSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
};

type GrowthOpportunityStatusMock =
  | "new"
  | "queued"
  | "sent"
  | "converted"
  | "archived";

type GrowthOpportunitySourceModuleMock =
  | "clients"
  | "schedule"
  | "work-order"
  | "finance";

type GrowthOpportunityApiMock = {
  id: string;
  workspaceId: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  title: string;
  summary?: string | null;
  status: GrowthOpportunityStatusMock;
  sourceModule: GrowthOpportunitySourceModuleMock;
  expectedValueCents?: number | null;
  confidenceScore?: number | null;
  lastInteractionAt?: string | null;
  dueAt?: string | null;
  createdAt: string;
};

type GrowthPlaybookGoalMock = "reactivation" | "upsell" | "recovery";
type GrowthPlaybookChannelMock = "email" | "whatsapp" | "sms";

type GrowthPlaybookApiMock = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  enabled: boolean;
  channels: GrowthPlaybookChannelMock[];
  goal: GrowthPlaybookGoalMock;
  delayHours: number;
  maxTouches: number;
  updatedAt?: string | null;
};

type GrowthSummaryApiMock = {
  workspaceId: string;
  windowStart: string;
  windowEnd: string;
  dispatchedCount: number;
  convertedCount: number;
  conversionRatePercent: number;
  recoveredRevenueCents: number;
  averageHoursToConvert: number | null;
};

type GrowthDispatchPayloadMock = {
  workspaceId?: string;
  actorUid?: string;
  playbookId?: string;
  opportunityIds?: string[];
};

type GrowthPlaybooksUpsertPayloadMock = {
  workspaceId?: string;
  actorUid?: string;
  playbooks?: GrowthPlaybookApiMock[];
};

function createSeed(): GrowthSeed {
  const unique = Date.now();
  return {
    email: `cypress.growth+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress Growth ${unique}`,
    workspaceId: "ws-cypress-growth-001",
    workspaceName: "Cypress Growth Workspace",
  };
}

function normalizeQueryValue(value: unknown): string | undefined {
  if (Array.isArray(value) && value.length > 0) {
    return normalizeQueryValue(value[0]);
  }
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return undefined;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function toNonNegativeInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

function typeIntoControlInput(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const input = $element.is("input,textarea")
      ? $element
      : $element.find("input,textarea");
    const wrapped = cy.wrap(input)
      .should("have.length.greaterThan", 0)
      .first()
      .scrollIntoView()
      .click({ force: true })
      .type("{selectAll}{backspace}", { force: true });

    if (value.length > 0) {
      wrapped.type(value, { force: true });
    }
  });
}

function selectAntdOption(selector: string, optionLabel: string): void {
  cy.getBySel(selector).click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", optionLabel).click({
    force: true,
  });
}

function computeSummary(
  workspaceId: string,
  opportunities: GrowthOpportunityApiMock[],
  from: string,
  to: string
): GrowthSummaryApiMock {
  const dispatchedCount = opportunities.filter(
    (item) => item.status === "sent" || item.status === "converted"
  ).length;
  const convertedCount = opportunities.filter(
    (item) => item.status === "converted"
  ).length;
  const recoveredRevenueCents = opportunities
    .filter((item) => item.status === "converted")
    .reduce((sum, item) => sum + Number(item.expectedValueCents ?? 0), 0);
  const conversionRatePercent =
    dispatchedCount > 0 ? Number(((convertedCount / dispatchedCount) * 100).toFixed(2)) : 0;

  return {
    workspaceId,
    windowStart: from,
    windowEnd: to,
    dispatchedCount,
    convertedCount,
    conversionRatePercent,
    recoveredRevenueCents,
    averageHoursToConvert: convertedCount > 0 ? 16 : null,
  };
}

function mockLoginAndGrowthApis(seed: GrowthSeed): void {
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
      description: "E2E workspace for growth autopilot",
    },
  };

  const opportunitiesState: GrowthOpportunityApiMock[] = [
    {
      id: "opp-growth-001",
      workspaceId: seed.workspaceId,
      clientName: "Bruna Silva",
      clientEmail: "bruna.silva@client.dev",
      title: "Win-back inactive salon clients",
      summary: "No bookings in the last 45 days.",
      status: "new",
      sourceModule: "schedule",
      expectedValueCents: 98000,
      confidenceScore: 74,
      lastInteractionAt: dayjs().subtract(46, "day").toISOString(),
      dueAt: dayjs().add(2, "day").toISOString(),
      createdAt: dayjs().subtract(1, "day").toISOString(),
    },
    {
      id: "opp-growth-002",
      workspaceId: seed.workspaceId,
      clientName: "Lucas Andrade",
      clientPhone: "+5511999988776",
      title: "Upsell post-service package",
      summary: "Completed premium service in the last 24h.",
      status: "queued",
      sourceModule: "work-order",
      expectedValueCents: 124000,
      confidenceScore: 68,
      lastInteractionAt: dayjs().subtract(1, "day").toISOString(),
      dueAt: dayjs().add(1, "day").toISOString(),
      createdAt: dayjs().subtract(2, "day").toISOString(),
    },
    {
      id: "opp-growth-003",
      workspaceId: seed.workspaceId,
      clientName: "Fernanda Rocha",
      clientEmail: "fernanda.rocha@client.dev",
      title: "Recover delayed billing",
      summary: "Service executed with pending payment follow-up.",
      status: "converted",
      sourceModule: "finance",
      expectedValueCents: 159000,
      confidenceScore: 81,
      lastInteractionAt: dayjs().subtract(4, "day").toISOString(),
      dueAt: dayjs().toISOString(),
      createdAt: dayjs().subtract(5, "day").toISOString(),
    },
  ];

  let playbooksState: GrowthPlaybookApiMock[] = [
    {
      id: "playbook-reactivation",
      workspaceId: seed.workspaceId,
      title: "Reactivate inactive clients",
      description: "Bring dormant customers back using recovery campaigns.",
      enabled: true,
      channels: ["whatsapp", "email"],
      goal: "reactivation",
      delayHours: 6,
      maxTouches: 3,
      updatedAt: nowIso,
    },
    {
      id: "playbook-upsell",
      workspaceId: seed.workspaceId,
      title: "Upsell after completion",
      description: "Offer complementary services after successful deliveries.",
      enabled: true,
      channels: ["email"],
      goal: "upsell",
      delayHours: 4,
      maxTouches: 2,
      updatedAt: nowIso,
    },
    {
      id: "playbook-recovery",
      workspaceId: seed.workspaceId,
      title: "Recover late billing",
      description: "Follow-up actions for pending payment opportunities.",
      enabled: true,
      channels: ["email", "sms"],
      goal: "recovery",
      delayHours: 2,
      maxTouches: 4,
      updatedAt: nowIso,
    },
  ];

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-growth-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-growth-firebase-id-token",
        refreshToken: "cypress-growth-firebase-refresh-token",
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
            localId: "uid-cypress-growth-owner",
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
      uid: "uid-cypress-growth-owner",
      claims: { role: "owner" },
    },
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.fullName,
      email: seed.email,
      planId: 3,
      planTitle: "Scale",
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
        planTitle: "Scale",
      },
      modules: [
        { uid: "growth-autopilot", name: "Growth", icon: "sparkles" },
        { uid: "clients", name: "Clients", icon: "users" },
        { uid: "work-order", name: "Work order", icon: "layout-dashboard" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/growth\/internal\/opportunities(?:\?.*)?$/, (req) => {
    req.alias = "listGrowthOpportunitiesRequest";

    const queryStatus = normalizeQueryValue(req.query.status)?.toLowerCase();
    const querySearch = normalizeQueryValue(req.query.search)?.toLowerCase().trim() ?? "";
    const limit = toPositiveInt(normalizeQueryValue(req.query.limit), 20);
    const offset = toNonNegativeInt(normalizeQueryValue(req.query.offset), 0);

    const filtered = opportunitiesState.filter((item) => {
      const byStatus = queryStatus ? item.status === queryStatus : true;
      if (!byStatus) return false;
      if (!querySearch) return true;

      const haystack = [
        item.clientName,
        item.clientEmail,
        item.clientPhone,
        item.title,
        item.summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(querySearch);
    });

    const items = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < filtered.length;

    req.reply({
      statusCode: 200,
      body: {
        items,
        pagination: {
          total: filtered.length,
          offset,
          limit,
          hasMore,
        },
      },
    });
  });

  cy.intercept("GET", /\/growth\/internal\/playbooks(?:\?.*)?$/, (req) => {
    req.alias = "listGrowthPlaybooksRequest";
    req.reply({
      statusCode: 200,
      body: {
        playbooks: playbooksState,
      },
    });
  });

  cy.intercept("GET", /\/growth\/internal\/attribution\/summary(?:\?.*)?$/, (req) => {
    req.alias = "listGrowthSummaryRequest";

    const from =
      normalizeQueryValue(req.query.from) ??
      dayjs().subtract(30, "day").format("YYYY-MM-DD");
    const to = normalizeQueryValue(req.query.to) ?? dayjs().format("YYYY-MM-DD");

    req.reply({
      statusCode: 200,
      body: computeSummary(seed.workspaceId, opportunitiesState, from, to),
    });
  });

  cy.intercept("POST", /\/growth\/internal\/dispatch(?:\?.*)?$/, (req) => {
    req.alias = "dispatchGrowthOpportunitiesRequest";
    const body = req.body as GrowthDispatchPayloadMock;
    const ids = Array.isArray(body.opportunityIds) ? body.opportunityIds : [];

    expect(body.workspaceId).to.eq(seed.workspaceId);
    expect(body.actorUid).to.eq("uid-cypress-growth-owner");
    expect(ids).to.have.length.greaterThan(0);

    ids.forEach((id) => {
      const target = opportunitiesState.find((item) => item.id === id);
      if (target && target.status !== "converted") {
        target.status = "sent";
      }
    });

    req.reply({
      statusCode: 200,
      body: {
        dispatchedCount: ids.length,
      },
    });
  });

  cy.intercept("POST", /\/growth\/internal\/playbooks(?:\?.*)?$/, (req) => {
    req.alias = "upsertGrowthPlaybooksRequest";
    const body = req.body as GrowthPlaybooksUpsertPayloadMock;

    expect(body.workspaceId).to.eq(seed.workspaceId);
    expect(body.actorUid).to.eq("uid-cypress-growth-owner");
    expect(body.playbooks).to.be.an("array").and.have.length(3);

    const updatedAt = new Date().toISOString();
    playbooksState = (body.playbooks ?? []).map((playbook) => ({
      ...playbook,
      workspaceId: seed.workspaceId,
      updatedAt,
    }));

    req.reply({
      statusCode: 200,
      body: {
        playbooks: playbooksState,
      },
    });
  });
}

describe("Login + Growth autopilot", () => {
  it("logs in and executes the growth flow across opportunities, playbooks and attribution", () => {
    const seed = createSeed();
    mockLoginAndGrowthApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/growth");
    cy.getBySel("growth-autopilot-page").should("be.visible");
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 });
    cy.wait("@listGrowthPlaybooksRequest", { timeout: 30000 });
    cy.wait("@listGrowthSummaryRequest", { timeout: 30000 });

    cy.getBySel("growth-autopilot-opportunities-count").should(
      "contain.text",
      "3 opportunities"
    );
    cy.getBySel("growth-autopilot-playbooks-count").should(
      "contain.text",
      "3 playbooks"
    );
    cy.getBySel("growth-autopilot-source-tag").should("contain.text", "backend");

    cy.getBySel("growth-opportunities-pane").should("be.visible");
    cy.contains('[data-cy="growth-opportunities-table-wrap"]', "Bruna Silva").should(
      "be.visible"
    );

    typeIntoControlInput("growth-opportunities-search-input", "Bruna");
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 }).then((interception) => {
      const query = interception.request.query as Record<string, unknown>;
      expect(normalizeQueryValue(query.search)).to.eq("Bruna");
    });
    cy.contains('[data-cy="growth-opportunities-table-wrap"]', "Bruna Silva").should(
      "be.visible"
    );

    typeIntoControlInput("growth-opportunities-search-input", "");
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 });

    selectAntdOption("growth-opportunities-status-select", "Queued");
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 }).then((interception) => {
      const query = interception.request.query as Record<string, unknown>;
      expect(normalizeQueryValue(query.status)).to.eq("queued");
    });
    cy.contains('[data-cy="growth-opportunities-table-wrap"]', "Lucas Andrade").should(
      "be.visible"
    );

    selectAntdOption("growth-opportunities-status-select", "All statuses");
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 });

    selectAntdOption(
      "growth-opportunities-playbook-select",
      "Reactivate inactive clients"
    );

    cy.contains('[data-cy="growth-opportunities-table-wrap"] tr', "Bruna Silva")
      .first()
      .find(".ant-checkbox-input")
      .check({ force: true });
    cy.getBySel("growth-opportunities-dispatch-button")
      .should("contain.text", "Dispatch (1)")
      .click({ force: true });

    cy.wait("@dispatchGrowthOpportunitiesRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const requestBody = interception.request.body as GrowthDispatchPayloadMock;
      expect(requestBody.workspaceId).to.eq(seed.workspaceId);
      expect(requestBody.playbookId).to.eq("playbook-reactivation");
      expect(requestBody.opportunityIds).to.deep.eq(["opp-growth-001"]);
    });
    cy.wait("@listGrowthOpportunitiesRequest", { timeout: 30000 });
    cy.wait("@listGrowthSummaryRequest", { timeout: 30000 });
    cy.contains("1 opportunity(ies) dispatched.", { timeout: 30000 }).should("be.visible");
    cy.contains('[data-cy="growth-opportunities-table-wrap"] tr', "Bruna Silva").should(
      "contain.text",
      "Sent"
    );

    cy.contains('[role="tab"]', "Playbooks").click({ force: true });
    cy.getBySel("growth-playbooks-pane").should("be.visible");
    cy.getBySel("growth-playbook-enabled-switch").click({ force: true });
    selectAntdOption("growth-playbook-goal-select", "Recovery");
    typeIntoControlInput("growth-playbook-delay-input", "12");
    cy.getBySel("growth-playbooks-save-button").click({ force: true });

    cy.wait("@upsertGrowthPlaybooksRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const requestBody = interception.request.body as GrowthPlaybooksUpsertPayloadMock;
      const firstPlaybook = requestBody.playbooks?.[0];
      expect(requestBody.workspaceId).to.eq(seed.workspaceId);
      expect(firstPlaybook?.enabled).to.eq(false);
      expect(firstPlaybook?.goal).to.eq("recovery");
      expect(firstPlaybook?.delayHours).to.eq(12);
      expect(firstPlaybook?.maxTouches).to.be.greaterThan(0);
    });
    cy.contains("Playbooks saved.", { timeout: 30000 }).should("be.visible");

    cy.contains('[role="tab"]', "Attribution").click({ force: true });
    cy.getBySel("growth-attribution-pane").should("be.visible");
    cy.getBySel("growth-attribution-card-dispatched").should("contain.text", "Dispatched opportunities");
    cy.getBySel("growth-attribution-card-dispatched").should("contain.text", "2");
    cy.getBySel("growth-attribution-card-converted").should("contain.text", "1");
    cy.getBySel("growth-attribution-card-recovered-revenue").should("contain.text", "Recovered revenue");
    cy.getBySel("growth-attribution-next-actions-card").should("be.visible");
  });
});

export {};
