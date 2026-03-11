type WorkOrderSettingsSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
};

type WorkOrderSettingsState = {
  defaultPriority: "low" | "medium" | "high" | "urgent";
  defaultEstimatedDurationMinutes: number;
  autoFillDueAtOnCreate: boolean;
  defaultDueInHours: number;
  dueSoonWindowHours: number;
  requireWorkerOnCreate: boolean;
  requireChecklistToComplete: boolean;
  requireAttachmentToComplete: boolean;
  attachmentsEnabled: boolean;
  maxAttachmentsPerWorkOrder: number;
  maxAttachmentSizeMb: number;
  allowedAttachmentMimeTypes: string[];
};

function createSeed(): WorkOrderSettingsSeed {
  const unique = Date.now();
  return {
    email: `cypress.workorder.settings+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress WO Settings ${unique}`,
    workspaceId: "ws-cypress-work-order-settings-001",
    workspaceName: "Cypress Work Order Settings Workspace",
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

function expectControlInputValue(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const input = $element.is("input") ? $element : $element.find("input");
    cy.wrap(input)
      .should("have.length.greaterThan", 0)
      .first()
      .should("have.value", value);
  });
}

function selectAntdOption(selector: string, optionLabel: string): void {
  cy.getBySel(selector).click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", optionLabel).click({
    force: true,
  });
}

function mockLoginAndWorkOrderSettingsApis(seed: WorkOrderSettingsSeed): void {
  let settingsState: WorkOrderSettingsState = {
    defaultPriority: "medium",
    defaultEstimatedDurationMinutes: 60,
    autoFillDueAtOnCreate: true,
    defaultDueInHours: 24,
    dueSoonWindowHours: 24,
    requireWorkerOnCreate: false,
    requireChecklistToComplete: false,
    requireAttachmentToComplete: false,
    attachmentsEnabled: true,
    maxAttachmentsPerWorkOrder: 25,
    maxAttachmentSizeMb: 25,
    allowedAttachmentMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ],
  };

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
      description: "E2E workspace for work-order settings flow",
    },
  };

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-work-order-settings-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-work-order-settings-firebase-id-token",
        refreshToken: "cypress-work-order-settings-firebase-refresh-token",
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
            localId: "uid-cypress-work-order-settings-owner",
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
      uid: "uid-cypress-work-order-settings-owner",
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
        lastGeneratedAt: new Date().toISOString(),
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
        { uid: "settings", name: "Settings", icon: "settings" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/api\/v1\/work-order\/settings(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        workspaceId: seed.workspaceId,
        settings: settingsState,
        source: "database",
        updatedAt: new Date().toISOString(),
      },
    },
  }).as("getWorkOrderSettingsRequest");

  cy.intercept("PUT", /\/api\/v1\/work-order\/settings(?:\?.*)?$/, (req) => {
    const body = req.body as {
      workspaceId?: string;
      settings?: Partial<WorkOrderSettingsState>;
      updatedBy?: string | null;
    };

    settingsState = {
      ...settingsState,
      ...(body.settings ?? {}),
    };

    req.reply({
      statusCode: 200,
      body: {
        data: {
          workspaceId: body.workspaceId ?? seed.workspaceId,
          settings: settingsState,
          source: "database",
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }).as("upsertWorkOrderSettingsRequest");
}

describe("Login + Work-order settings", () => {
  it("logs in, edits work-order settings and saves successfully", () => {
    const seed = createSeed();
    mockLoginAndWorkOrderSettingsApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/work-order/settings");
    cy.getBySel("work-order-settings-page").should("be.visible");
    cy.wait("@getWorkOrderSettingsRequest", { timeout: 30000 });
    cy.getBySel("work-order-settings-form").should("be.visible");

    selectAntdOption("work-order-settings-default-priority-select", "High");
    typeIntoControlInput("work-order-settings-default-duration-input", "90");
    typeIntoControlInput("work-order-settings-default-due-hours-input", "48");
    typeIntoControlInput("work-order-settings-due-soon-window-input", "36");

    cy.contains('[role="tab"]', "Workflow").click({ force: true });
    cy.getBySel("work-order-settings-require-worker-switch").click({ force: true });
    cy.getBySel("work-order-settings-require-checklist-switch").click({ force: true });

    cy.contains('[role="tab"]', "Attachments").click({ force: true });
    cy.getBySel("work-order-settings-attachments-enabled-switch").click({ force: true });
    typeIntoControlInput("work-order-settings-max-attachments-input", "12");
    typeIntoControlInput("work-order-settings-max-attachment-size-input", "10");

    cy.getBySel("work-order-settings-save-button").click({ force: true });
    cy.wait("@upsertWorkOrderSettingsRequest", { timeout: 30000 }).then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      const requestBody = interception.request.body as {
        workspaceId: string;
        settings: WorkOrderSettingsState;
        updatedBy?: string | null;
      };

      expect(requestBody.workspaceId).to.eq(seed.workspaceId);
      expect(requestBody.updatedBy).to.eq("uid-cypress-work-order-settings-owner");
      expect(requestBody.settings.defaultPriority).to.eq("high");
      expect(requestBody.settings.defaultEstimatedDurationMinutes).to.eq(90);
      expect(requestBody.settings.defaultDueInHours).to.eq(48);
      expect(requestBody.settings.dueSoonWindowHours).to.eq(36);
      expect(requestBody.settings.requireWorkerOnCreate).to.eq(true);
      expect(requestBody.settings.requireChecklistToComplete).to.eq(true);
      expect(requestBody.settings.attachmentsEnabled).to.eq(false);
      expect(requestBody.settings.maxAttachmentsPerWorkOrder).to.eq(12);
      expect(requestBody.settings.maxAttachmentSizeMb).to.eq(10);
    });

    cy.contains("Work-order settings saved", { timeout: 30000 }).should("be.visible");

    cy.getBySel("work-order-settings-restore-defaults-button").click({ force: true });
    expectControlInputValue("work-order-settings-max-attachments-input", "25");
    expectControlInputValue("work-order-settings-max-attachment-size-input", "25");
    cy.getBySel("work-order-settings-attachments-enabled-switch").should(
      "have.attr",
      "aria-checked",
      "true"
    );
  });
});

export {};
