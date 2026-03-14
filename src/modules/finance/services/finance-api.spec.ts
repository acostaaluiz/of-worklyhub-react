import type { HttpClient } from "@core/http/interfaces/http-client.interface";
import { FinanceApi } from "./finance-api";

function createApi(response: DataValue) {
  const request = jest.fn().mockResolvedValue({ data: response });
  const http = { request } as unknown as HttpClient;
  const api = new FinanceApi(http);
  return { api, request };
}

describe("FinanceApi", () => {
  it("lists entry types and entries with workspace header", async () => {
    const typesCtx = createApi([{ id: "income", name: "Income", direction: "income" }]);
    const entriesCtx = createApi([{ id: "entry-1", amount_cents: 1500 }]);

    await expect(typesCtx.api.listEntryTypes("ws-1")).resolves.toEqual([
      { id: "income", name: "Income", direction: "income" },
    ]);
    await expect(
      entriesCtx.api.listEntries("ws-1", {
        start: "2026-03-01",
        end: "2026-03-31",
        limit: 20,
        offset: 0,
      })
    ).resolves.toEqual([{ id: "entry-1", amount_cents: 1500 }]);

    expect(typesCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/finance/internal/entry-types",
        headers: expect.objectContaining({ "x-workspace-id": "ws-1" }),
      })
    );
    expect(entriesCtx.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        url: "/finance/entries",
        query: expect.objectContaining({ start: "2026-03-01", end: "2026-03-31" }),
      })
    );
  });

  it("creates finance entries with content-type and workspace headers", async () => {
    const { api, request } = createApi({ id: "entry-created" });

    await expect(
      api.createEntry("ws-1", {
        typeId: "income",
        amount_cents: 2500,
        occurred_at: "2026-03-10T10:00:00.000Z",
        description: "Payment from work order",
      })
    ).resolves.toEqual({ id: "entry-created" });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        url: "/finance/entries",
        headers: expect.objectContaining({
          "x-workspace-id": "ws-1",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("falls back to /finance/internal/revenue when /finance/revenue fails", async () => {
    const request = jest
      .fn()
      .mockRejectedValueOnce(new Error("public-revenue-down"))
      .mockResolvedValueOnce({
        data: { revenue_cents: 10000, period: "month", start: "2026-03-01", end: "2026-03-31" },
      });
    const api = new FinanceApi({ request } as unknown as HttpClient);

    const revenue = await api.getRevenue("ws-1", { period: "month" });

    expect(revenue).toEqual({
      revenue_cents: 10000,
      period: "month",
      start: "2026-03-01",
      end: "2026-03-31",
    });
    expect(request.mock.calls[0][0].url).toBe("/finance/revenue");
    expect(request.mock.calls[1][0].url).toBe("/finance/internal/revenue");
  });

  it("returns safe defaults when list endpoints fail", async () => {
    const request = jest.fn().mockRejectedValue(new Error("finance-down"));
    const api = new FinanceApi({ request } as unknown as HttpClient);

    await expect(api.listEntryTypes("ws-1")).resolves.toEqual([]);
    await expect(api.listEntries("ws-1")).resolves.toEqual([]);
    await expect(api.getRevenue("ws-1", { period: "month" })).resolves.toBeNull();
  });

  it("gets dashboard and insights payloads", async () => {
    const dashboardCtx = createApi({
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "day" },
      kpis: { revenue_cents: 1000, expense_cents: 400, profit_cents: 600, margin_pct: 60 },
      variation: { revenue_pct: 1, expense_pct: 1, profit_pct: 1, margin_pct_points: 1 },
      trend: [],
      cashflow: [],
      top_services: [],
    });
    const insightsCtx = createApi({
      period: { start: "2026-03-01", end: "2026-03-31" },
      summary: { total: 0, high: 0, medium: 0, low: 0 },
      insights: [],
    });
    const pricingCtx = createApi({
      period: { start: "2026-03-01", end: "2026-03-31", label: "month" },
      summary: {
        total: 1,
        increases: 1,
        decreases: 0,
        unchanged: 0,
        with_history: 1,
        without_history: 0,
      },
      suggestions: [
        {
          service_id: "svc-1",
          service_name: "Cleaning",
          current_price_cents: 10000,
          suggested_price_cents: 11000,
          delta_cents: 1000,
          expected_impact: "increase-margin",
          confidence: 0.82,
          rationale: "Strong demand supports increase.",
          origin: "ai",
        },
      ],
    });

    await expect(
      dashboardCtx.api.getDashboard("ws-1", {
        start: "2026-03-01",
        end: "2026-03-31",
      })
    ).resolves.toMatchObject({
      period: { start: "2026-03-01", end: "2026-03-31" },
    });

    await expect(
      insightsCtx.api.getInsights("ws-1", {
        start: "2026-03-01",
        end: "2026-03-31",
      })
    ).resolves.toMatchObject({
      summary: { total: 0, high: 0, medium: 0, low: 0 },
    });

    await expect(
      pricingCtx.api.getPricingSuggestions("ws-1", {
        period: "month",
        engine: "hybrid",
      })
    ).resolves.toMatchObject({
      summary: {
        total: 1,
      },
      suggestions: [expect.objectContaining({ service_id: "svc-1" })],
    });
  });

  it("returns null when pricing suggestions endpoint fails", async () => {
    const request = jest.fn().mockRejectedValue(new Error("pricing-down"));
    const api = new FinanceApi({ request } as unknown as HttpClient);

    await expect(
      api.getPricingSuggestions("ws-1", {
        period: "month",
        engine: "hybrid",
      })
    ).resolves.toBeNull();
  });
});
