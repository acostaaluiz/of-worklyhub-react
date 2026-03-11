import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { DashboardApi } from "./dashboard-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new DashboardApi(http);
  return { api, request };
}

describe("DashboardApi", () => {
  it("requests summary, trend and alerts with workspace header", async () => {
    const summaryCtx = createApi({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-10", bucket: "day" },
      kpis: {
        revenueCents: 1000,
        profitCents: 200,
        expenseCents: 800,
        marginPct: 20,
        avgTicketCents: 500,
        servicesCompleted: 2,
        appointmentsToday: 1,
        openWorkOrders: 3,
        activeWorkers: 4,
        completionRatePct: 80,
      },
      variation: {
        revenuePct: 5,
        profitPct: 4,
        expensePct: 3,
        marginPctPoints: 2,
      },
      topServices: [],
    });
    const trendCtx = createApi({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-10", bucket: "day" },
      series: [],
    });
    const alertsCtx = createApi({
      generatedAt: "2026-03-10T10:00:00.000Z",
      period: { start: "2026-03-01", end: "2026-03-10", bucket: "day" },
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      alerts: [],
    });

    const query = {
      start: "2026-03-01",
      end: "2026-03-10",
      bucket: "day" as const,
    };
    await summaryCtx.api.getSummary("ws-1", query);
    await trendCtx.api.getTrend("ws-1", query);
    await alertsCtx.api.getAlerts("ws-1", query);

    expect(summaryCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/dashboard/internal/summary",
        query,
        headers: expect.objectContaining({
          "x-workspace-id": "ws-1",
          Accept: "application/json",
        }),
      })
    );
    expect(trendCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/dashboard/internal/trend",
      })
    );
    expect(alertsCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/dashboard/internal/alerts",
      })
    );
  });
});

