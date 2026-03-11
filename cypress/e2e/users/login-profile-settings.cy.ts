type UserProfileSeed = {
  email: string;
  password: string;
  fullName: string;
  updatedFullName: string;
  updatedPhoneDigits: string;
  workspaceId: string;
  workspaceName: string;
  updatedTradeName: string;
  updatedLegalName: string;
  updatedEmployees: number;
  updatedPrimaryService: string;
  updatedIndustry: string;
  updatedDescription: string;
};

function createSeed(): UserProfileSeed {
  const unique = Date.now();
  return {
    email: `cypress.users+${unique}@worklyhub.dev`,
    password: String(Cypress.env("e2ePassword")),
    fullName: `Cypress User ${unique}`,
    updatedFullName: `Cypress User Updated ${unique}`,
    updatedPhoneDigits: "11987654321",
    workspaceId: "ws-cypress-users-001",
    workspaceName: "Cypress Users Workspace",
    updatedTradeName: `Trade ${unique}`,
    updatedLegalName: `Legal ${unique}`,
    updatedEmployees: 22,
    updatedPrimaryService: "beauty",
    updatedIndustry: "services",
    updatedDescription: "Updated company profile by Cypress E2E",
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

function typeIntoTextInput(selector: string, value: string): void {
  cy.getBySel(selector).then(($element) => {
    const field =
      $element.is("input,textarea") ? $element : $element.find("input,textarea");
    cy.wrap(field)
      .should("have.length.greaterThan", 0)
      .first()
      .scrollIntoView()
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

function mockLoginAndUsersProfileApis(seed: UserProfileSeed): void {
  const nowIso = new Date().toISOString();

  const userProfileState: {
    name: string;
    email: string;
    phone?: string;
    planId?: number;
  } = {
    name: seed.fullName,
    email: seed.email,
    phone: "11911112222",
    planId: 1,
  };

  let workspaceState: Record<string, unknown> = {
    id: seed.workspaceId,
    workspaceId: seed.workspaceId,
    name: seed.workspaceName,
    fullName: seed.fullName,
    email: seed.email,
    accountType: "company",
    workspace_type: "company",
    tradeName: "Initial Trade",
    legalName: "Initial Legal",
    employeesCount: 7,
    industry: "retail",
    primaryService: "retail",
    description: "Initial workspace description",
    company_profile: {
      trade_name: "Initial Trade",
      legal_name: "Initial Legal",
      employees_count: 7,
      industry: "retail",
      primary_service: "retail",
      description: "Initial workspace description",
    },
  };

  cy.intercept(
    "POST",
    /https:\/\/identitytoolkit\.googleapis\.com\/v1\/accounts:signInWithPassword.*/,
    {
      statusCode: 200,
      body: {
        kind: "identitytoolkit#VerifyPasswordResponse",
        localId: "uid-cypress-users-owner",
        email: seed.email,
        displayName: seed.fullName,
        idToken: "cypress-users-firebase-id-token",
        refreshToken: "cypress-users-firebase-refresh-token",
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
            localId: "uid-cypress-users-owner",
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
      uid: "uid-cypress-users-owner",
      claims: { role: "owner" },
    },
  }).as("verifyTokenRequest");

  cy.intercept("GET", /\/users\/internal\/users(?:\?.*)?$/, {
    statusCode: 200,
    body: {
      ...userProfileState,
      planTitle: "Premium",
    },
  }).as("userProfileRequest");

  cy.intercept("PUT", /\/users\/internal\/users\/profile(?:\?.*)?$/, (req) => {
    const body = req.body as { fullName?: string; email?: string; phone?: string };
    expect(body.fullName).to.eq(seed.updatedFullName);
    expect(body.email).to.eq(seed.email);
    expect(body.phone).to.eq(seed.updatedPhoneDigits);

    userProfileState.name = body.fullName ?? userProfileState.name;
    userProfileState.email = body.email ?? userProfileState.email;
    userProfileState.phone = body.phone ?? userProfileState.phone;

    req.reply({
      statusCode: 200,
      body: {
        user: {
          name: userProfileState.name,
          email: userProfileState.email,
          phone: userProfileState.phone,
          planId: userProfileState.planId,
        },
      },
    });
  }).as("updatePersonalProfileRequest");

  cy.intercept("GET", /\/company\/internal\/workspace(?:\?.*)?$/, {
    statusCode: 200,
    body: { workspace: workspaceState },
  }).as("workspaceRequest");

  cy.intercept("PUT", /\/company\/internal\/workspaces\/[^/]+\/profile(?:\?.*)?$/, (req) => {
    const body = req.body as {
      accountType?: "individual" | "company";
      legalName?: string;
      tradeName?: string;
      employeesCount?: number;
      industry?: string;
      primaryService?: string;
      description?: string;
    };

    expect(body.accountType).to.eq("company");
    expect(body.legalName).to.eq(seed.updatedLegalName);
    expect(body.tradeName).to.eq(seed.updatedTradeName);
    expect(body.employeesCount).to.eq(seed.updatedEmployees);
    expect(body.industry).to.eq(seed.updatedIndustry);
    expect(body.primaryService).to.eq(seed.updatedPrimaryService);
    expect(body.description).to.eq(seed.updatedDescription);

    workspaceState = {
      ...workspaceState,
      accountType: body.accountType,
      workspace_type: body.accountType,
      legalName: body.legalName,
      tradeName: body.tradeName,
      employeesCount: body.employeesCount,
      industry: body.industry,
      primaryService: body.primaryService,
      description: body.description,
      company_profile: {
        legal_name: body.legalName,
        trade_name: body.tradeName,
        employees_count: body.employeesCount,
        industry: body.industry,
        primary_service: body.primaryService,
        description: body.description,
      },
    };

    req.reply({
      statusCode: 200,
      body: {
        workspace: workspaceState,
      },
    });
  }).as("updateCompanyProfileRequest");

  cy.intercept("GET", "**/internal/application/categories*", {
    statusCode: 200,
    body: {
      categories: [
        { uid: "beauty", name: "Beauty" },
        { uid: "maintenance", name: "Maintenance" },
      ],
    },
  }).as("categoriesRequest");

  cy.intercept("GET", "**/internal/application/industries*", {
    statusCode: 200,
    body: {
      industries: [
        { uid: "services", name: "Services" },
        { uid: "retail", name: "Retail" },
      ],
    },
  }).as("industriesRequest");

  cy.intercept("GET", "**/internal/application/plans*", {
    statusCode: 200,
    body: {
      plans: [
        {
          id: 1,
          title: "Premium",
          subtitle: "Growth plan",
          monthly_amount: 9900,
          yearly_amount: 99000,
          supports: ["all"],
          is_active: true,
        },
      ],
    },
  }).as("plansRequest");

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
        { uid: "users", name: "Users", icon: "users" },
        { uid: "company", name: "Company", icon: "briefcase" },
      ],
    },
  }).as("overviewRequest");
}

describe("Login + Users profile settings", () => {
  it("logs in and saves both Personal info and Company info tabs", () => {
    const seed = createSeed();
    mockLoginAndUsersProfileApis(seed);

    cy.visit("/login");
    cy.getBySel("login-form").should("be.visible");
    cy.getBySel("login-email-input").type(seed.email);
    cy.getBySel("login-password-input").type(seed.password, { log: false });
    cy.getBySel("login-submit-button").click();

    cy.wait("@firebaseSignInRequest", { timeout: 30000 });
    cy.wait("@verifyTokenRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/home");

    cy.visit("/users");
    cy.getBySel("users-profile-page").should("be.visible");
    cy.getBySel("users-profile-tabs").should("be.visible");
    cy.wait("@categoriesRequest", { timeout: 30000 });
    cy.wait("@industriesRequest", { timeout: 30000 });
    cy.wait("@userProfileRequest", { timeout: 30000 });
    cy.wait("@workspaceRequest", { timeout: 30000 });

    cy.getBySel("users-profile-tab-personal").should("be.visible");
    cy.getBySel("users-personal-form").should("be.visible");
    typeIntoTextInput("users-personal-full-name-input", seed.updatedFullName);
    typeIntoTextInput("users-personal-phone-input", seed.updatedPhoneDigits);
    cy.getBySel("users-personal-phone-input").blur({ force: true });
    cy.getBySel("users-personal-save-button").click({ force: true });

    cy.wait("@updatePersonalProfileRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains("Personal information saved", { timeout: 30000 }).should("be.visible");

    cy.getBySel("users-profile-tab-company").click({ force: true });
    cy.getBySel("users-company-form").should("be.visible");

    cy.getBySel("users-company-account-type-company-radio").click({ force: true });
    typeIntoControlInput("users-company-employees-input", String(seed.updatedEmployees));
    typeIntoTextInput("users-company-legal-name-input", seed.updatedLegalName);
    typeIntoTextInput("users-company-trade-name-input", seed.updatedTradeName);
    selectAntdOption("users-company-primary-service-select", "Beauty");
    selectAntdOption("users-company-industry-select", "Services");
    typeIntoTextInput("users-company-description-input", seed.updatedDescription);
    cy.getBySel("users-company-save-button").click({ force: true });

    cy.wait("@updateCompanyProfileRequest", { timeout: 30000 })
      .its("response.statusCode")
      .should("eq", 200);
    cy.contains("Company information saved", { timeout: 30000 }).should("be.visible");
  });
});

export {};
