type AssistantChatSeed = {
  uid: string;
  email: string;
  workspaceId: string;
};

function createSeed(): AssistantChatSeed {
  return {
    uid: "uid-cypress-assistant-chat",
    email: "cypress.assistant.chat@worklyhub.dev",
    workspaceId: "ws-cypress-assistant-chat",
  };
}

function mockAssistantChatApis(seed: AssistantChatSeed): void {
  cy.intercept("GET", "**/me/overview*", {
    statusCode: 200,
    body: {
      profile: {
        uid: seed.uid,
        email: seed.email,
        planId: 3,
        planTitle: "Premium",
        planStatus: "ACTIVE-PLAN",
      },
      modules: [
        { uid: "dashboard", name: "Dashboard", icon: "dashboard" },
        { uid: "schedule", name: "Schedule", icon: "calendar" },
        { uid: "growth", name: "Growth", icon: "sparkles" },
      ],
    },
  }).as("overviewRequest");

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

  cy.intercept("POST", /\/chat\/internal\/assistant\/messages(?:\?.*)?$/, (request) => {
    const body = request.body as {
      message?: string;
      pagePath?: string;
      pageTitle?: string;
      workspaceId?: string;
      history?: Array<{ role?: string; content?: string }>;
    };

    expect(body.message, "assistant request message").to.eq(
      "Como reduzir conflitos de agenda no meu workspace?"
    );
    expect(body.pagePath, "assistant request pagePath").to.eq("/modules");
    expect(body.workspaceId, "assistant request workspaceId").to.eq(seed.workspaceId);
    expect(String(request.headers["x-workspace-id"] ?? ""), "workspace header").to.eq(
      seed.workspaceId
    );
    expect(Array.isArray(body.history), "assistant request history").to.eq(true);

    request.reply({
      statusCode: 200,
      body: {
        assistant: {
          name: "WorklyPilot AI",
          message:
            "Use a visao de agenda por colaborador e ajuste capacidade no People para reduzir choques.",
          suggestions: [
            {
              label: "Ir para Schedule",
              path: "/schedule",
              description: "Abrir agenda para revisar conflitos por dia e colaborador.",
            },
            {
              label: "Abrir People",
              path: "/people",
              description: "Revisar capacidade e disponibilidade da equipe.",
            },
          ],
        },
      },
    });
  }).as("assistantChatRequest");
}

describe("Assistant Chat widget", () => {
  it("opens chat, sends a message and renders assistant response with suggestions", () => {
    const seed = createSeed();
    mockAssistantChatApis(seed);

    cy.visit("/modules", {
      onBeforeLoad(win) {
        win.localStorage.setItem("auth.idToken", "cypress-assistant-chat-id-token");
        win.localStorage.setItem(
          "auth.session",
          JSON.stringify({
            uid: seed.uid,
            claims: {},
            email: seed.email,
          })
        );
        win.localStorage.setItem(
          "company.workspace",
          JSON.stringify({
            id: seed.workspaceId,
            workspaceId: seed.workspaceId,
            email: seed.email,
          })
        );
      },
    });

    cy.wait("@overviewRequest", { timeout: 30000 });
    cy.location("pathname", { timeout: 40000 }).should("eq", "/modules");

    cy.getBySel("assistant-chat-fab").should("be.visible").click({ force: true });
    cy.getBySel("assistant-chat-panel").should("be.visible");
    cy.contains('[data-cy="assistant-chat-message-row"]', "Oi! Eu sou o WorklyPilot").should(
      "be.visible"
    );

    cy.getBySel("assistant-chat-input").type(
      "Como reduzir conflitos de agenda no meu workspace?"
    );
    cy.getBySel("assistant-chat-send-button").click({ force: true });

    cy.wait("@assistantChatRequest", { timeout: 30000 });

    cy.contains(
      '[data-cy="assistant-chat-message-row"]',
      "Como reduzir conflitos de agenda no meu workspace?"
    ).should("be.visible");
    cy.contains(
      '[data-cy="assistant-chat-message-row"]',
      "Use a visao de agenda por colaborador"
    ).should("be.visible");
    cy.getBySel("assistant-chat-suggestion-button").should("have.length", 2);
    cy.contains('[data-cy="assistant-chat-suggestion-button"]', "Ir para Schedule").should(
      "be.visible"
    );
  });
});

export {};
