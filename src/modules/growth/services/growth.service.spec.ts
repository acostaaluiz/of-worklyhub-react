jest.mock("./growth-api", () => ({
  GrowthApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

jest.mock("@modules/users/services/auth.service", () => ({
  usersAuthService: {
    getSessionValue: jest.fn(),
  },
}));

import { GrowthApi } from "./growth-api";
import { GrowthService } from "./growth.service";
import { companyService } from "@modules/company/services/company.service";
import { usersAuthService } from "@modules/users/services/auth.service";

type GrowthApiMock = {
  listOpportunities: jest.Mock;
  listPlaybooks: jest.Mock;
  getAttributionSummary: jest.Mock;
  upsertPlaybooks: jest.Mock;
  dispatch: jest.Mock;
};

function createApiMock(): GrowthApiMock {
  return {
    listOpportunities: jest.fn().mockResolvedValue({
      items: [
        {
          id: "opp-1",
          workspaceId: "ws-1",
          clientName: "Benjamin",
          title: "No appointments in 30 days",
          status: "new",
          sourceModule: "schedule",
          createdAt: "2026-03-01T10:00:00.000Z",
        },
      ],
    }),
    listPlaybooks: jest.fn().mockResolvedValue({
      items: [
        {
          id: "pb-1",
          workspaceId: "ws-1",
          title: "Reactivate clients",
          enabled: true,
          channels: ["email"],
          goal: "reactivation",
          delayHours: 2,
          maxTouches: 3,
        },
      ],
    }),
    getAttributionSummary: jest.fn().mockResolvedValue({
      workspaceId: "ws-1",
      windowStart: "2026-02-01",
      windowEnd: "2026-02-28",
      dispatchedCount: 5,
      convertedCount: 2,
      conversionRatePercent: 40,
      recoveredRevenueCents: 120000,
      averageHoursToConvert: 12,
    }),
    upsertPlaybooks: jest.fn().mockResolvedValue({
      playbooks: [
        {
          id: "pb-1",
          workspaceId: "ws-1",
          title: "Reactivate clients",
          enabled: true,
          channels: ["email"],
          goal: "reactivation",
          delayHours: 2,
          maxTouches: 3,
          updatedAt: "2026-03-01T10:00:00.000Z",
        },
      ],
    }),
    dispatch: jest.fn().mockResolvedValue({
      dispatchedCount: 2,
    }),
  };
}

describe("GrowthService", () => {
  const growthApiCtor = jest.mocked(GrowthApi);
  const mockedCompanyService = jest.mocked(companyService);
  const mockedAuthService = jest.mocked(usersAuthService);
  let apiMock: GrowthApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    growthApiCtor.mockImplementation(() => apiMock as unknown as GrowthApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    mockedAuthService.getSessionValue.mockReturnValue({ uid: "user-1" } as never);
  });

  it("loads dashboard from backend when endpoints return mapped data", async () => {
    const service = new GrowthService();

    const bundle = await service.fetchDashboard({ workspaceId: "ws-1", status: "all" });

    expect(bundle.source).toBe("backend");
    expect(bundle.opportunities).toHaveLength(1);
    expect(bundle.playbooks).toHaveLength(1);
    expect(bundle.summary.dispatchedCount).toBe(5);
    expect(apiMock.listOpportunities).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
      })
    );
  });

  it("falls back to local snapshot when backend endpoints fail", async () => {
    apiMock.listOpportunities.mockRejectedValueOnce(new Error("growth-api-down"));
    const service = new GrowthService();

    const bundle = await service.fetchDashboard({ workspaceId: "ws-1", search: "reactivate" });

    expect(bundle.source).toBe("fallback");
    expect(Array.isArray(bundle.opportunities)).toBe(true);
    expect(bundle.playbooks.length).toBeGreaterThan(0);
  });

  it("throws validation error when workspace is missing", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new GrowthService();

    await expect(service.fetchDashboard()).rejects.toMatchObject({
      message: "Workspace is required to load growth autopilot.",
      kind: "Validation",
    });
  });

  it("saves normalized playbooks with backend and fallback paths", async () => {
    const service = new GrowthService();

    const backendSaved = await service.savePlaybooks("ws-1", [
      {
        id: " pb-1 ",
        workspaceId: "",
        title: "  Reactivation  ",
        description: "  Bring clients back  ",
        enabled: true,
        channels: ["email", "invalid" as never],
        goal: "reactivation",
        delayHours: -4,
        maxTouches: 0,
        updatedAt: null,
      },
    ]);

    expect(backendSaved[0]).toMatchObject({
      id: "pb-1",
      workspaceId: "ws-1",
      title: "Reactivate clients",
    });
    expect(apiMock.upsertPlaybooks).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "ws-1",
        actorUid: "user-1",
        playbooks: [
          expect.objectContaining({
            id: "pb-1",
            delayHours: 0,
            maxTouches: 1,
            channels: ["email"],
          }),
        ],
      })
    );

    apiMock.upsertPlaybooks.mockRejectedValueOnce(new Error("save-failed"));
    const fallbackSaved = await service.savePlaybooks("ws-1", [
      {
        id: " pb-fallback ",
        workspaceId: "",
        title: "  Recovery  ",
        description: null,
        enabled: true,
        channels: ["sms"],
        goal: "recovery",
        delayHours: 2,
        maxTouches: 2,
        updatedAt: null,
      },
    ]);

    expect(fallbackSaved[0]).toMatchObject({
      id: "pb-fallback",
      workspaceId: "ws-1",
      channels: ["sms"],
      goal: "recovery",
    });
  });

  it("dispatches opportunities and supports backend/fallback responses", async () => {
    const service = new GrowthService();

    const backendResult = await service.dispatch("ws-1", [" opp-1 ", ""]);
    expect(backendResult).toEqual({
      workspaceId: "ws-1",
      dispatchedCount: 2,
      source: "backend",
    });

    apiMock.dispatch.mockRejectedValueOnce(new Error("dispatch-failed"));
    const fallbackResult = await service.dispatch("ws-1", ["opp-2"]);
    expect(fallbackResult).toEqual({
      workspaceId: "ws-1",
      dispatchedCount: 1,
      source: "fallback",
    });
  });

  it("maps module aliases and resolves workspace from company id when workspaceId is absent", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ id: 123 } as never);
    apiMock.listOpportunities.mockResolvedValueOnce({
      items: [
        {
          id: "opp-wo",
          customerName: "Client Work",
          trigger: "Work order trigger",
          sourceModule: "work_order",
          created_at: "2026-03-01T10:00:00.000Z",
        },
        {
          id: "opp-fin",
          contactName: "Client Finance",
          title: "Finance trigger",
          module: "finance",
          createdAt: "2026-03-01T11:00:00.000Z",
        },
        {
          id: "opp-client",
          clientName: "Client Generic",
          title: "Generic trigger",
          sourceModule: "something-else",
          createdAt: "2026-03-01T12:00:00.000Z",
        },
      ],
    });
    const service = new GrowthService();

    const bundle = await service.fetchDashboard();

    expect(apiMock.listOpportunities).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: "123",
      })
    );
    expect(bundle.opportunities.map((item) => item.sourceModule).sort()).toEqual([
      "clients",
      "finance",
      "work-order",
    ]);
  });

  it("applies fallback status overrides to dispatched opportunities while preserving others", async () => {
    apiMock.listOpportunities.mockRejectedValue(new Error("growth-api-down"));
    const service = new GrowthService();

    await service.dispatch("ws-1", ["fallback-reactivation-01"]);
    const bundle = await service.fetchDashboard({ workspaceId: "ws-1", status: "all" });

    const sent = bundle.opportunities.find((item) => item.id === "fallback-reactivation-01");
    const untouched = bundle.opportunities.find((item) => item.id === "fallback-upsell-02");
    expect(sent?.status).toBe("sent");
    expect(untouched?.status).toBe("queued");
  });

  it("reuses stored fallback playbooks when backend save and fetch are unavailable", async () => {
    apiMock.upsertPlaybooks.mockRejectedValueOnce(new Error("save-failed"));
    apiMock.listOpportunities.mockRejectedValue(new Error("growth-api-down"));
    const service = new GrowthService();

    const saved = await service.savePlaybooks("ws-1", [
      {
        id: "pb-local",
        workspaceId: "",
        title: "Local PB",
        description: null,
        enabled: true,
        channels: ["sms"],
        goal: "recovery",
        delayHours: 2,
        maxTouches: 2,
        updatedAt: null,
      },
    ]);
    expect(saved[0].id).toBe("pb-local");

    const firstBundle = await service.fetchDashboard({ workspaceId: "ws-1" });
    firstBundle.playbooks[0].channels.push("email");
    const secondBundle = await service.fetchDashboard({ workspaceId: "ws-1" });

    expect(secondBundle.playbooks[0].id).toBe("pb-local");
    expect(secondBundle.playbooks[0].channels).toEqual(["sms"]);
  });

  it("validates dispatch input ids", async () => {
    const service = new GrowthService();

    await expect(service.dispatch("ws-1", ["", "  "])).rejects.toMatchObject({
      message: "Select at least one opportunity to dispatch.",
      kind: "Validation",
    });
  });

  it("validates workspace requirement for savePlaybooks and dispatch", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new GrowthService();

    await expect(
      service.savePlaybooks("", [
        {
          id: "pb-1",
          workspaceId: "",
          title: "No workspace",
          description: null,
          enabled: true,
          channels: ["email"],
          goal: "reactivation",
          delayHours: 1,
          maxTouches: 1,
          updatedAt: null,
        },
      ])
    ).rejects.toMatchObject({
      message: "Workspace is required to save playbooks.",
      kind: "Validation",
    });

    await expect(service.dispatch("", ["opp-1"])).rejects.toMatchObject({
      message: "Workspace is required to dispatch opportunities.",
      kind: "Validation",
    });
  });
});
