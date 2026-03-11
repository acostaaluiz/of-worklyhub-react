 
import React from "react";
import { render, waitFor } from "@testing-library/react";

jest.mock("@modules/company/services/company-services.service", () => ({
  CompanyServicesService: jest.fn(),
}));

jest.mock("@modules/finance/services/finance-api", () => ({
  FinanceApi: jest.fn(),
}));

jest.mock("@modules/company/services/company.service", () => ({
  companyService: {
    getWorkspaceValue: jest.fn(),
  },
}));

jest.mock("@core/storage/mock-store.provider", () => ({
  useMockStore: jest.fn(),
}));

import { CompanyServicesService } from "@modules/company/services/company-services.service";
import { FinanceApi } from "@modules/finance/services/finance-api";
import { companyService } from "@modules/company/services/company.service";
import { useMockStore } from "@core/storage/mock-store.provider";
import { FinanceService, useFinanceApi } from "./finance.service";

type CompanyServicesMock = {
  list: jest.Mock;
};

type FinanceApiMock = {
  listEntries: jest.Mock;
  createEntry: jest.Mock;
  listEntryTypes: jest.Mock;
  getRevenue: jest.Mock;
  getDashboard: jest.Mock;
  getInsights: jest.Mock;
};

type StoreMock = {
  finance: Array<DataMap>;
  addFinanceEntry: jest.Mock;
  removeFinanceEntry: jest.Mock;
};

function createCompanyServicesMock(): CompanyServicesMock {
  return {
    list: jest.fn().mockResolvedValue([
      {
        id: "svc-1",
        title: "Cleaning",
        priceCents: 10000,
      },
    ]),
  };
}

function createFinanceApiMock(): FinanceApiMock {
  return {
    listEntries: jest.fn().mockResolvedValue([
      {
        id: "entry-1",
        amount_cents: 1500,
        occurred_at: "2026-03-10T10:00:00.000Z",
        type_id: "income",
      },
    ]),
    createEntry: jest.fn().mockResolvedValue({ id: "entry-created" }),
    listEntryTypes: jest.fn().mockResolvedValue([
      {
        id: "income",
        key: "income",
        name: "Income",
        direction: "income",
      },
      {
        id: "expense",
        key: "expense",
        name: "Expense",
        direction: "expense",
      },
    ]),
    getRevenue: jest.fn().mockResolvedValue({ revenue_cents: 1234 }),
    getDashboard: jest.fn().mockResolvedValue({
      period: { start: "2026-03-01", end: "2026-03-31", bucket: "day" },
      kpis: {
        revenue_cents: 200000,
        expense_cents: 90000,
        profit_cents: 110000,
        margin_pct: 55,
      },
      variation: {
        revenue_pct: 12,
        expense_pct: 4,
        profit_pct: 16,
        margin_pct_points: 3,
      },
      trend: [{ bucket: "2026-03-10", revenue_cents: 30000, profit_cents: 18000 }],
      cashflow: [
        {
          id: "cf-1",
          occurred_at: "2026-03-10T11:00:00.000Z",
          description: "Work-order completion",
          amount_cents: 30000,
          type_id: "income",
          type_name: "Income",
          type_direction: "income",
          work_order_id: "wo-1",
          metadata: { scheduleId: "sch-1", relatedEntryId: "re-1" },
          source: "work-order",
        },
        {
          id: "cf-2",
          occurred_at: "2026-03-10T12:00:00.000Z",
          description: "Supplies purchase",
          amount_cents: -5000,
          type_id: "expense",
          type_name: "Expense",
          type_direction: "expense",
          metadata: {},
          source: "manual",
        },
      ],
      top_services: [
        {
          service_id: "svc-1",
          service_name: "Cleaning",
          orders: 8,
          quantity: 8,
          revenue_cents: 64000,
          avg_ticket_cents: 8000,
        },
      ],
    }),
    getInsights: jest.fn().mockResolvedValue({
      period: { start: "2026-03-01", end: "2026-03-31" },
      summary: { total: 1, high: 0, medium: 1, low: 0 },
      insights: [
        {
          id: "insight-1",
          priority: "medium",
          category: "growth",
          title: "Upsell opportunity",
          description: "High conversion window after completion.",
          evidence: { baseline: "ok" },
          actions: [
            {
              id: "act-1",
              label: "Trigger campaign",
              kind: "marketing",
              target: "clients",
            },
          ],
        },
      ],
    }),
  };
}

function createStoreMock(): StoreMock {
  const store: StoreMock = {
    finance: [],
    addFinanceEntry: jest.fn(),
    removeFinanceEntry: jest.fn(),
  };

  store.addFinanceEntry.mockImplementation((entry: DataMap) => {
    const id =
      typeof entry.id === "string" && entry.id.trim().length > 0
        ? entry.id
        : `f-${Math.random().toString(16).slice(2)}`;
    const next = { ...entry, id };
    store.finance = [next, ...store.finance];
    return next;
  });
  store.removeFinanceEntry.mockImplementation((id: string) => {
    store.finance = store.finance.filter((row) => row.id !== id);
  });

  return store;
}

function hookHarness(onReady: (api: ReturnType<typeof useFinanceApi>) => void) {
  function Harness() {
    const api = useFinanceApi();

    React.useEffect(() => {
      onReady(api);
    }, [api]);

    return null;
  }

  return Harness;
}

async function mountHookApi() {
  let capturedApi: ReturnType<typeof useFinanceApi> | null = null;
  const Harness = hookHarness((api) => {
    capturedApi = api;
  });

  render(React.createElement(Harness));
  await waitFor(() => expect(capturedApi).not.toBeNull());
  return capturedApi as ReturnType<typeof useFinanceApi>;
}

describe("FinanceService", () => {
  const companyServicesCtor = jest.mocked(CompanyServicesService);
  const financeApiCtor = jest.mocked(FinanceApi);
  const mockedCompanyService = jest.mocked(companyService);
  const mockedUseMockStore = jest.mocked(useMockStore);
  let companyServicesMock: CompanyServicesMock;
  let apiMock: FinanceApiMock;
  let store: StoreMock;

  beforeEach(() => {
    jest.clearAllMocks();
    companyServicesMock = createCompanyServicesMock();
    apiMock = createFinanceApiMock();
    store = createStoreMock();

    companyServicesCtor.mockImplementation(() => companyServicesMock as unknown as CompanyServicesService);
    financeApiCtor.mockImplementation(() => apiMock as unknown as FinanceApi);
    mockedCompanyService.getWorkspaceValue.mockReturnValue({ workspaceId: "ws-1" } as never);
    mockedUseMockStore.mockReturnValue(store as never);
  });

  it("handles in-memory entry create/list/remove flows", async () => {
    const service = new FinanceService();

    const created = await service.createEntry({
      type: "income",
      amountCents: 1200,
      date: "2026-03-10",
      description: "Manual entry",
    });
    const rows = await service.listEntries();
    const removed = await service.removeEntry(created.id);
    const missing = await service.removeEntry("missing-id");

    expect(rows.some((row) => row.id === created.id)).toBe(true);
    expect(removed).toBe(true);
    expect(missing).toBe(false);
  });

  it("suggests service prices and wraps listing failures", async () => {
    const service = new FinanceService();

    await expect(
      service.suggestPriceForService({ id: "svc-1", title: "Cleaning", priceCents: 10000 } as never)
    ).resolves.toBe(8500);

    const withSuggestions = await service.listServicesWithSuggestions();
    expect(withSuggestions).toEqual([
      expect.objectContaining({
        id: "svc-1",
        suggestedCents: 8500,
      }),
    ]);

    companyServicesMock.list.mockRejectedValueOnce(new Error("services-failure"));
    await expect(service.listServicesWithSuggestions()).rejects.toMatchObject({
      message: "services-failure",
      kind: "Unknown",
    });
  });

  it("maps finance dashboard and insights from backend payload", async () => {
    const service = new FinanceService();

    const result = await service.getFinance({
      from: "2026-03-01",
      to: "2026-03-31",
      groupBy: "day",
      view: "overview",
    });

    expect(result.kpis).toHaveLength(4);
    expect(result.kpis[0]).toMatchObject({
      id: "revenue",
      value: 2000,
      format: "money",
    });
    expect(result.revenueSeries.points).toEqual([
      expect.objectContaining({
        label: "2026-03-10",
        value: 300,
      }),
    ]);
    expect(result.cashflow).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "cf-1",
          type: "in",
          workOrderId: "wo-1",
          scheduleId: "sch-1",
          relatedEntryId: "re-1",
          source: "work-order",
        }),
        expect.objectContaining({
          id: "cf-2",
          type: "out",
          category: "Expense",
        }),
      ])
    );
    expect(result.topServices).toEqual([
      expect.objectContaining({
        id: "svc-1",
        orders: 8,
        revenue: 640,
      }),
    ]);
    expect(result.insights).toEqual([
      expect.objectContaining({
        id: "insight-1",
        actions: [expect.objectContaining({ id: "act-1", kind: "marketing" })],
      }),
    ]);
  });

  it("falls back to mocked finance dataset when backend dashboard fails", async () => {
    apiMock.getDashboard.mockRejectedValueOnce(new Error("dashboard-down"));
    const service = new FinanceService();

    const fallback = await service.getFinance({
      from: "2026-03-01",
      to: "2026-03-20",
      groupBy: "week",
      view: "overview",
    });

    expect(fallback.kpis).toHaveLength(4);
    expect(fallback.cashflow.length).toBeGreaterThan(0);
    expect(fallback.topServices.length).toBeGreaterThan(0);
  });

  it("returns monthly revenue safely across success/null/error paths", async () => {
    const service = new FinanceService();

    apiMock.getRevenue.mockResolvedValueOnce({ revenue_cents: 1234.4 });
    await expect(service.getRevenueForMonth("ws-1")).resolves.toBe(1234);

    apiMock.getRevenue.mockResolvedValueOnce(null);
    await expect(service.getRevenueForMonth("ws-1")).resolves.toBeNull();

    apiMock.getRevenue.mockRejectedValueOnce(new Error("revenue-down"));
    await expect(service.getRevenueForMonth("ws-1")).resolves.toBeNull();
  });

  it("exposes hook api for entries and caches list calls by query key", async () => {
    const api = await mountHookApi();

    const first = await api.listEntries({
      workspaceId: "ws-hook-1",
      start: "2026-03-01",
      end: "2026-03-31",
      limit: 20,
      offset: 0,
    });
    const second = await api.listEntries({
      workspaceId: "ws-hook-1",
      start: "2026-03-01",
      end: "2026-03-31",
      limit: 20,
      offset: 0,
    });

    expect(first).toEqual([
      expect.objectContaining({
        id: "entry-1",
        amount: 15,
        type: "income",
        typeId: "income",
      }),
    ]);
    expect(second).toEqual(first);
    expect(apiMock.listEntries).toHaveBeenCalledTimes(1);
  });

  it("creates/removes entries through hook and falls back when backend create fails", async () => {
    const api = await mountHookApi();

    apiMock.createEntry.mockResolvedValueOnce({ id: "entry-hook-1" });
    const created = await api.createEntry({
      workspaceId: "ws-hook-2",
      type: "income",
      amount: 25,
      date: "2026-03-10",
      note: "Hook create",
    });

    expect(created).toMatchObject({ id: "entry-hook-1" });
    expect(store.addFinanceEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "entry-hook-1",
        amount: 25,
      })
    );

    apiMock.createEntry.mockRejectedValueOnce(new Error("create-failed"));
    const fallbackCreated = await api.createEntry({
      workspaceId: "ws-hook-2",
      type: "expense",
      amount: 10,
      date: "2026-03-11",
      note: "Fallback create",
    });
    expect(typeof fallbackCreated.id).toBe("string");
    expect(fallbackCreated.id.length).toBeGreaterThan(0);

    await expect(api.removeEntry("entry-hook-1")).resolves.toBe(true);
    expect(store.removeFinanceEntry).toHaveBeenCalledWith("entry-hook-1");
  });

  it("returns fallback entry types when backend yields empty or fails", async () => {
    apiMock.listEntryTypes.mockResolvedValueOnce([]);
    const api = await mountHookApi();

    const fallbackFromEmpty = await api.listEntryTypes("ws-hook-types-1");
    expect(fallbackFromEmpty).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "income" }),
        expect.objectContaining({ id: "expense" }),
      ])
    );

    apiMock.listEntryTypes.mockRejectedValueOnce(new Error("types-down"));
    const fallbackFromError = await api.listEntryTypes("ws-hook-types-2");
    expect(fallbackFromError).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "fixed" })])
    );
  });
});

