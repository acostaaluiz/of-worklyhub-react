jest.mock("@core/utils/mask", () => ({
  centsToMoney: (value: number) => value / 100,
  formatDateShort: () => "Short date",
}));

jest.mock("./dashboard-api", () => ({
  DashboardApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

import { DashboardApi } from "./dashboard-api";
import { companyService } from "@modules/company/services/company.service";
import { DashboardService } from "./dashboard.service";

type DashboardApiMock = {
  getSummary: jest.Mock;
  getTrend: jest.Mock;
  getAlerts: jest.Mock;
};

function createApiMock(): DashboardApiMock {
  return {
    getSummary: jest.fn().mockResolvedValue({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "day" },
      kpis: {
        revenueCents: 100000,
        profitCents: 30000,
        expenseCents: 70000,
        marginPct: 30,
        avgTicketCents: 5000,
        servicesCompleted: 22,
        appointmentsToday: 5,
        openWorkOrders: 7,
        activeWorkers: 4,
        completionRatePct: 82,
      },
      variation: {
        revenuePct: 8,
        profitPct: 5,
        expensePct: 3,
        marginPctPoints: 1.5,
      },
      topServices: [
        {
          serviceId: "svc-1",
          serviceName: "Deep Cleaning",
          orders: 10,
          quantity: 10,
          revenueCents: 50000,
          avgTicketCents: 5000,
        },
      ],
    }),
    getTrend: jest.fn().mockResolvedValue({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "day" },
      series: [
        {
          bucket: "2026-03-01",
          revenueCents: 12000,
          profitCents: 4000,
        },
      ],
    }),
    getAlerts: jest.fn().mockResolvedValue({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "day" },
      summary: { total: 1, high: 1, medium: 0, low: 0 },
      alerts: [
        {
          id: "alert-1",
          source: "finance",
          priority: "high",
          title: "Overdue receivable",
          description: "Invoice pending for more than 7 days",
          suggestedAction: "Send automated reminder",
        },
      ],
    }),
  };
}

describe("DashboardService", () => {
  const dashboardApiCtor = jest.mocked(DashboardApi);
  const mockedCompanyService = jest.mocked(companyService);
  let apiMock: DashboardApiMock;

  beforeEach(() => {
    jest.clearAllMocks();
    apiMock = createApiMock();
    dashboardApiCtor.mockImplementation(() => apiMock as unknown as DashboardApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
  });

  it("maps dashboard summary/trend/alerts into UI models", async () => {
    const service = new DashboardService();

    const result = await service.getDashboard({
      from: "2026-03-01",
      to: "2026-03-31",
      groupBy: "day",
    });

    expect(result.kpis).toHaveLength(4);
    expect(result.kpis[0]).toMatchObject({
      id: "appointments",
      value: 5,
    });
    expect(result.revenueSeries).toHaveLength(1);
    expect(result.revenueSeries[0]).toMatchObject({
      key: "2026-03-01",
      revenue: 120,
      profit: 40,
    });
    expect(result.serviceBreakdown).toEqual([
      {
        serviceId: "svc-1",
        serviceName: "Deep Cleaning",
        count: 10,
        revenue: 500,
      },
    ]);
    expect(result.alerts).toHaveLength(1);
  });

  it("builds fallback trend buckets and tolerates alerts endpoint failures", async () => {
    apiMock.getTrend.mockResolvedValueOnce({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "week" },
      series: [],
    });
    apiMock.getAlerts.mockRejectedValueOnce(new Error("alerts-offline"));
    const service = new DashboardService();

    const result = await service.getDashboard({
      from: "2026-03-01",
      to: "2026-03-20",
      groupBy: "week",
    });

    expect(result.revenueSeries.length).toBeGreaterThan(0);
    expect(result.alerts).toEqual([]);
  });

  it("wraps workspace validation and rejected summary/trend requests", async () => {
    mockedCompanyService.getWorkspaceValue.mockReturnValue(null as never);
    const service = new DashboardService();

    await expect(
      service.getDashboard({
        from: "2026-03-01",
        to: "2026-03-31",
        groupBy: "month",
      })
    ).rejects.toMatchObject({
      message: "workspaceId is required",
      kind: "Unknown",
    });

    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    apiMock.getSummary.mockRejectedValueOnce(new Error("summary-failed"));
    await expect(
      service.getDashboard({
        from: "2026-03-01",
        to: "2026-03-31",
        groupBy: "month",
      })
    ).rejects.toMatchObject({
      message: "summary-failed",
      kind: "Unknown",
    });

    apiMock.getSummary.mockResolvedValueOnce(createApiMock().getSummary());
    apiMock.getTrend.mockRejectedValueOnce(new Error("trend-failed"));
    await expect(
      service.getDashboard({
        from: "2026-03-01",
        to: "2026-03-31",
        groupBy: "month",
      })
    ).rejects.toMatchObject({
      message: "trend-failed",
      kind: "Unknown",
    });
  });
});

