import {
  allModuleCardsText,
  assertRequiredCredentials,
  fetchOverview,
  loginWithCredentials,
  moduleText,
  readApiBaseUrl,
  readCredentials,
  toBooleanEnv,
} from "./real-entitlement.helpers";

const runRealEntitlement = toBooleanEnv(Cypress.env("runRealEntitlement"));
const apiBaseUrl = readApiBaseUrl();
const ownerCredentials = readCredentials("premiumEmail", "premiumPassword");

const describeReal = runRealEntitlement ? describe : describe.skip;

describeReal("Real employee workspace scope + hierarchy access", () => {
  before(() => {
    assertRequiredCredentials(
      ownerCredentials,
      "CYPRESS_PREMIUM_EMAIL",
      "CYPRESS_PREMIUM_PASSWORD"
    );
  });

  it("owner invites employee and activated member sees modules filtered by hierarchy + plan", () => {
    const stamp = Date.now();
    const activatedEmployee = {
      email: `rita.e2e.infra.${stamp}@worklyhub.dev`,
      password: String(Cypress.env("e2ePassword") ?? "WorklyHub123!"),
      name: "Rita Infra E2E",
    };
    const invitedEmployee = {
      email: `rita.e2e.invite.${stamp}@worklyhub.dev`,
      name: "Rita Invite E2E",
    };

    loginWithCredentials(ownerCredentials);

    cy.window({ timeout: 30000 })
      .then((win) => {
        const token = win.localStorage.getItem("auth.idToken");
        expect(token, "owner auth.idToken should exist").to.be.a("string");
        const workspaceRaw = win.localStorage.getItem("company.workspace");
        expect(workspaceRaw, "company.workspace should be cached after owner login").to.be.a(
          "string"
        );
        const workspace = workspaceRaw ? (JSON.parse(workspaceRaw) as Record<string, unknown>) : {};
        const workspaceId = String(workspace.workspaceId ?? workspace.id ?? "").trim();
        expect(workspaceId, "workspace id").to.not.equal("");
        return { ownerToken: token as string, workspaceId };
      })
      .then(({ ownerToken, workspaceId }) => {
        return cy
          .request({
            method: "PUT",
            url: `${apiBaseUrl}/people/internal/settings`,
            headers: {
              Authorization: `Bearer ${ownerToken}`,
              "x-workspace-id": workspaceId,
            },
            body: {
              workspaceId,
              settings: {
                employeeAccess: {
                  enabled: true,
                  defaultProfileUid: "operator",
                  profiles: [
                    {
                      uid: "manager",
                      name: "Manager",
                      allowedModules: [
                        "clients",
                        "company",
                        "dashboard",
                        "finance",
                        "growth",
                        "inventory",
                        "people",
                        "schedule",
                        "services",
                        "sla",
                        "work-order",
                      ],
                    },
                    {
                      uid: "operator",
                      name: "Operator",
                      allowedModules: [
                        "clients",
                        "inventory",
                        "people",
                        "schedule",
                        "services",
                        "work-order",
                      ],
                    },
                    {
                      uid: "it-infra",
                      name: "IT / Infra",
                      allowedModules: [
                        "clients",
                        "inventory",
                        "schedule",
                        "services",
                        "work-order",
                      ],
                    },
                  ],
                },
              },
            },
          })
          .then((settingsResponse) => {
            expect(settingsResponse.status).to.eq(200);

            return cy
              .request({
                method: "POST",
                url: `${apiBaseUrl}/internal/auth/register`,
                body: {
                  email: activatedEmployee.email,
                  password: activatedEmployee.password,
                  name: activatedEmployee.name,
                },
              })
              .then((registerResponse) => {
                expect(registerResponse.status).to.eq(201);
                const userUid = String(
                  (registerResponse.body as Record<string, unknown>)?.uid ?? ""
                ).trim();
                expect(userUid, "activated employee uid").to.not.equal("");

                return cy
                  .request({
                    method: "POST",
                    url: `${apiBaseUrl}/people/workers`,
                    headers: { Authorization: `Bearer ${ownerToken}` },
                    body: {
                      workspace_id: workspaceId,
                      user_uid: userUid,
                      user_email: activatedEmployee.email,
                      user_name: activatedEmployee.name,
                      job_title: "IT Analyst",
                      department: "Technology",
                      access_profile_uid: "it-infra",
                    },
                  })
                  .then((workerResponse) => {
                    expect(workerResponse.status).to.eq(201);
                    const worker = (workerResponse.body as Record<string, unknown>)
                      ?.worker as
                      | Record<string, unknown>
                      | undefined;
                    expect(worker?.invitation_status, "direct-created employee should be active").to.eq(
                      "active"
                    );

                    return cy
                      .request({
                        method: "POST",
                        url: `${apiBaseUrl}/people/workers`,
                        headers: { Authorization: `Bearer ${ownerToken}` },
                        body: {
                          workspace_id: workspaceId,
                          user_email: invitedEmployee.email,
                          user_name: invitedEmployee.name,
                          job_title: "Operator",
                          department: "Operations",
                          access_profile_uid: "operator",
                        },
                      })
                      .then((inviteResponse) => {
                        expect(inviteResponse.status).to.eq(201);
                        const invited = (inviteResponse.body as Record<string, unknown>)
                          ?.worker as
                          | Record<string, unknown>
                          | undefined;
                        expect(invited?.invitation_status, "invited employee should require activation")
                          .to.eq("pending_activation");
                        expect(
                          String(invited?.invitation_sent_at ?? "").trim(),
                          "invitation timestamp should be present"
                        ).to.not.equal("");
                      });
                  });
              });
          });
      });

    cy.clearLocalStorage();
    cy.clearCookies();

    loginWithCredentials(activatedEmployee);

    fetchOverview(apiBaseUrl).then(({ modules }) => {
      const modulesText = moduleText(modules);
      expect(modulesText, "infra employee should include schedule").to.include("schedule");
      expect(modulesText, "infra employee should include services").to.include("services");
      expect(modulesText, "infra employee should not include dashboard").to.not.include(
        "dashboard"
      );
      expect(modulesText, "infra employee should not include growth").to.not.include("growth");
      expect(modulesText, "infra employee should not include sla").to.not.include("sla");
    });

    cy.visit("/modules");
    cy.getBySel("all-modules-page").should("be.visible");
    allModuleCardsText().then((cardsText) => {
      expect(cardsText, "dashboard card should be hidden").to.not.include("dashboard");
      expect(cardsText, "growth card should be hidden").to.not.include("growth");
      expect(cardsText, "sla card should be hidden").to.not.include("sla");
      expect(cardsText, "schedule card should be visible").to.include("schedule");
    });

    cy.visit("/schedule");
    cy.location("pathname", { timeout: 30000 }).should("match", /^\/schedule(\/|$)/);

    cy.visit("/dashboard");
    cy.location("pathname", { timeout: 30000 }).should("not.match", /^\/dashboard(\/|$)/);

    cy.visit("/growth");
    cy.location("pathname", { timeout: 30000 }).should("not.match", /^\/growth(\/|$)/);
  });
});

export {};
