type SettingsSeed = {
  email: string;
  password: string;
  fullName: string;
  workspaceId: string;
  workspaceName: string;
};

type WorkspaceSettingsState = {
  enabled: boolean;
  modules: {
    "work-order": boolean;
    schedule: boolean;
    finance: boolean;
    inventory: boolean;
    people: boolean;
    clients: boolean;
  };
};

type NfeConfigurationState = {
  environment: "production" | "homologation";
  integration: {
    provider: string;
    baseUrl: string;
    issuePath: string;
    method: "POST" | "PUT";
    timeoutMs: number;
    retries: number;
    auth: {
      type: "none" | "bearer" | "api-key" | "basic";
      token?: string;
      headerName?: string;
      apiKey?: string;
      username?: string;
      password?: string;
    };
    headers?: Record<string, string>;
    payloadTemplate?: Record<string, unknown>;
    responseMapping?: Record<string, string>;
  };
  issuer: {
    legalName: string;
    document: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    taxRegime?: string;
    address?: Record<string, unknown>;
  };
  defaults?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function createSeed(): SettingsSeed {
  const unique = Date.now();
  return {
    email: `cypress.settings+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress Settings ${unique}`,
    workspaceId: "ws-cypress-settings-001",
    workspaceName: "Cypress Settings Workspace",
  };
}

function typeIntoControlInput(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const input = $element.is("input,textarea")
      ? $element
      : $element.find("input,textarea");
    cy.wrap(input)
      .should("have.length.greaterThan", 0)
      .first()
      .scrollIntoView()
      .click({ force: true })
      .type("{selectAll}{backspace}", { force: true })
      .type(value, { force: true, parseSpecialCharSequences: false });
  });
}

function selectAntdOption(selector: string, optionLabel: string): void {
  cy.getBySel(selector).click({ force: true });
  cy.contains(".ant-select-dropdown:visible .ant-select-item-option", optionLabel).click({
    force: true,
  });
}

function mockLoginAndSettingsApis(seed: SettingsSeed): void {
  const nowIso = new Date().toISOString();

  let workspaceSettingsState: WorkspaceSettingsState = {
    enabled: true,
    modules: {
      "work-order": true,
      schedule: true,
      finance: false,
      inventory: false,
      people: false,
      clients: false,
    },
  };

  let nfeConfigurationState: NfeConfigurationState = {
    environment: "homologation",
    integration: {
      provider: "govbr",
      baseUrl: "https://api.initial-provider.dev",
      issuePath: "/nfse/issue",
      method: "POST",
      timeoutMs: 15000,
      retries: 1,
      auth: { type: "none" },
    },
    issuer: {
      legalName: "Initial Legal Name",
      document: "12345678901234",
    },
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
      description: "E2E workspace for global settings",
    },
  };

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-settings-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-settings-firebase-id-token",
        refreshToken: "cypress-settings-firebase-refresh-token",
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
            localId: "uid-cypress-settings-owner",
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
      uid: "uid-cypress-settings-owner",
      claims: { role: "owner" },
    },
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      name: seed.fullName,
      email: seed.email,
      planId: 2,
      planTitle: "Premium",
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
        planTitle: "Premium",
      },
      modules: [
        { uid: "settings", name: "Settings", icon: "settings" },
        { uid: "work-order", name: "Work order", icon: "layout-dashboard" },
      ],
    },
  }).as("overviewRequest");

  cy.intercept("GET", /\/billing\/nfe\/workspace-settings(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        workspaceId: seed.workspaceId,
        settings: workspaceSettingsState,
        source: "database",
        updatedAt: nowIso,
      },
    },
  }).as("getWorkspaceBillingSettingsRequest");

  cy.intercept("PUT", /\/billing\/nfe\/workspace-settings(?:\?.*)?$/, (req) => {
    const body = req.body as {
      workspaceId?: string;
      settings?: WorkspaceSettingsState;
      updatedByUid?: string | null;
    };

    workspaceSettingsState = {
      ...workspaceSettingsState,
      ...(body.settings ?? {}),
      modules: {
        ...workspaceSettingsState.modules,
        ...(body.settings?.modules ?? {}),
      },
    };

    req.reply({
      statusCode: 200,
      body: {
        data: {
          workspaceId: body.workspaceId ?? seed.workspaceId,
          settings: workspaceSettingsState,
          source: "database",
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }).as("upsertWorkspaceBillingSettingsRequest");

  cy.intercept("GET", /\/billing\/nfe\/configurations\/service_sale(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      data: {
        id: "cfg-cypress-settings-001",
        contextType: "service_sale",
        issuerScope: "workspace",
        workspaceId: seed.workspaceId,
        configuration: nfeConfigurationState,
        resolution: "workspace",
        updatedAt: nowIso,
      },
    },
  }).as("getNfeConfigurationRequest");

  cy.intercept("PUT", /\/billing\/nfe\/configurations\/service_sale(?:\?.*)?$/, (req) => {
    const body = req.body as {
      workspaceId?: string;
      configuration?: NfeConfigurationState;
      updatedByUid?: string | null;
    };

    nfeConfigurationState = body.configuration ?? nfeConfigurationState;

    req.reply({
      statusCode: 200,
      body: {
        data: {
          id: "cfg-cypress-settings-001",
          contextType: "service_sale",
          issuerScope: "workspace",
          workspaceId: body.workspaceId ?? seed.workspaceId,
          configuration: nfeConfigurationState,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }).as("upsertNfeConfigurationRequest");
}

describe("Login + Global settings", () => {
  it("logs in and validates Billing, Issuance, Advanced and Appearance tabs", () => {
    const seed = createSeed();
    mockLoginAndSettingsApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/settings");
    cy.getBySel("settings-page").should("be.visible");
    cy.wait("@getWorkspaceBillingSettingsRequest", { timeout: 30000 });
    cy.wait("@getNfeConfigurationRequest", { timeout: 30000 });

    cy.getBySel("settings-tabs").should("be.visible");
    cy.getBySel("settings-tab-billing").should("be.visible");
    cy.getBySel("settings-tab-issuance").should("be.visible");
    cy.getBySel("settings-tab-advanced").should("be.visible");
    cy.getBySel("settings-tab-appearance").should("be.visible");

    cy.getBySel("settings-billing-form").should("be.visible");
    cy.getBySel("settings-billing-enabled-switch").click({ force: true });
    cy.getBySel("settings-billing-module-finance-switch").click({ force: true });
    cy.getBySel("settings-billing-save-button").click({ force: true });

    cy.wait("@upsertWorkspaceBillingSettingsRequest", { timeout: 30000 }).then(
      (interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const requestBody = interception.request.body as {
          workspaceId: string;
          settings: WorkspaceSettingsState;
          updatedByUid?: string | null;
        };
        expect(requestBody.workspaceId).to.eq(seed.workspaceId);
        expect(requestBody.updatedByUid).to.eq("uid-cypress-settings-owner");
        expect(requestBody.settings.enabled).to.eq(false);
        expect(requestBody.settings.modules.finance).to.eq(true);
      }
    );
    cy.contains("Billing rules updated.", { timeout: 30000 }).should("be.visible");

    cy.getBySel("settings-tab-issuance").click({ force: true });
    cy.getBySel("settings-issuance-form").should("be.visible");
    selectAntdOption("settings-issuance-environment-select", "Production");
    selectAntdOption("settings-issuance-auth-type-select", "API key");
    typeIntoControlInput("settings-issuance-provider-input", "acme-gov");
    typeIntoControlInput(
      "settings-issuance-base-url-input",
      "https://api.acme-gov.com"
    );
    typeIntoControlInput("settings-issuance-issue-path-input", "/fiscal/issue");
    typeIntoControlInput("settings-issuance-api-key-header-input", "x-api-key");
    typeIntoControlInput("settings-issuance-api-key-input", "super-secret-key");
    typeIntoControlInput("settings-issuance-legal-name-input", "ACME LTDA");
    typeIntoControlInput("settings-issuance-document-input", "12345678000190");
    cy.getBySel("settings-issuance-save-button").click({ force: true });

    cy.wait("@upsertNfeConfigurationRequest", { timeout: 30000 }).then(
      (interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const requestBody = interception.request.body as {
          workspaceId: string;
          configuration: NfeConfigurationState;
          updatedByUid?: string | null;
        };
        expect(requestBody.workspaceId).to.eq(seed.workspaceId);
        expect(requestBody.updatedByUid).to.eq("uid-cypress-settings-owner");
        expect(requestBody.configuration.environment).to.eq("production");
        expect(requestBody.configuration.integration.provider).to.eq("acme-gov");
        expect(requestBody.configuration.integration.auth.type).to.eq("api-key");
        expect(requestBody.configuration.integration.auth.headerName).to.eq(
          "x-api-key"
        );
        expect(requestBody.configuration.integration.auth.apiKey).to.eq(
          "super-secret-key"
        );
        expect(requestBody.configuration.issuer.legalName).to.eq("ACME LTDA");
      }
    );
    cy.contains("NF-e issuance settings updated.", { timeout: 30000 }).should(
      "be.visible"
    );

    cy.getBySel("settings-tab-advanced").click({ force: true });
    cy.getBySel("settings-advanced-form").should("be.visible");
    typeIntoControlInput(
      "settings-advanced-headers-input",
      '{"x-tenant":"worklyhub","x-flow":"e2e"}'
    );
    typeIntoControlInput(
      "settings-advanced-payload-template-input",
      '{"operationNature":"service"}'
    );
    typeIntoControlInput(
      "settings-advanced-response-mapping-input",
      '{"status":"status","accessKey":"access_key"}'
    );
    typeIntoControlInput(
      "settings-advanced-address-input",
      '{"street":"Avenue Cypress","number":"100","city":"Sao Paulo","state":"SP"}'
    );
    typeIntoControlInput(
      "settings-advanced-defaults-input",
      '{"serviceCode":"1401"}'
    );
    typeIntoControlInput(
      "settings-advanced-metadata-input",
      '{"owner":"workspace","suite":"cypress"}'
    );
    cy.getBySel("settings-advanced-save-button").click({ force: true });

    cy.wait("@upsertNfeConfigurationRequest", { timeout: 30000 }).then(
      (interception) => {
        expect(interception.response?.statusCode).to.eq(200);
        const requestBody = interception.request.body as {
          configuration: NfeConfigurationState;
        };
        expect(requestBody.configuration.integration.headers).to.deep.eq({
          "x-tenant": "worklyhub",
          "x-flow": "e2e",
        });
        expect(requestBody.configuration.defaults).to.deep.eq({
          serviceCode: "1401",
        });
        expect(requestBody.configuration.metadata).to.deep.eq({
          owner: "workspace",
          suite: "cypress",
        });
      }
    );
    cy.contains("NF-e issuance settings updated.", { timeout: 30000 }).should(
      "be.visible"
    );

    cy.getBySel("settings-tab-appearance").click({ force: true });
    cy.getBySel("settings-appearance-use-light-button").should("be.visible");
    cy.getBySel("settings-appearance-use-dark-button").should("be.visible");

    cy.getBySel("settings-appearance-use-light-button").click({ force: true });
    cy.document()
      .its("documentElement")
      .should("have.attr", "data-theme", "light");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("of-theme-preference")).to.eq("light");
    });

    cy.getBySel("settings-appearance-use-dark-button").click({ force: true });
    cy.document().its("documentElement").should("have.attr", "data-theme", "dark");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("of-theme-preference")).to.eq("dark");
    });
    cy.getBySel("settings-appearance-active-mode").should("contain.text", "Dark");
  });
});

export {};
